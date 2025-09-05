// === AVL Visualizer (self-contained drawing, RBT-style edges) ===

// DOM
const svg = document.getElementById("avl-canvas");
const input = document.getElementById("avl-input");
const statusEl = document.getElementById("avl-status");
const btnInsert = document.getElementById("avl-insert");
const btnDelete = document.getElementById("avl-delete");
const btnReset = document.getElementById("avl-reset");

if (!svg || !input || !statusEl || !btnInsert || !btnDelete || !btnReset) {
  console.error("One or more DOM elements not found. Check IDs in avl-visualizer.html.");
}

// === Canvas constants ===
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const CANVAS_PADDING = 60;
const NODE_RADIUS = 34;
const EDGE_STROKE = "#2A2D34";
const NODE_FILL = "#8BC34A"; // green
const TEXT_COLOR = "#FFFFFF"; // dark text readable on green

// Simple svg clear
function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

// === AVL Node ===
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
    this.element = null; // <g>
  }
}

let root = null;

// === AVL helpers ===
function getHeight(node) {
  return node ? node.height : 0;
}

function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateHeight(node) {
  if (node) node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function rightRotate(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function leftRotate(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function minValueNode(n) {
  let cur = n;
  while (cur.left) cur = cur.left;
  return cur;
}

function insertNode(node, value) {
  if (!node) return new Node(value);
  if (value < node.value) {
    node.left = insertNode(node.left, value);
  } else if (value > node.value) {
    node.right = insertNode(node.right, value);
  } else {
    return node; // ignore duplicates
  }

  updateHeight(node);
  const balance = getBalance(node);

  // LL
  if (balance > 1 && value < node.left.value) return rightRotate(node);
  // RR
  if (balance < -1 && value > node.right.value) return leftRotate(node);
  // LR
  if (balance > 1 && value > node.left.value) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }
  // RL
  if (balance < -1 && value < node.right.value) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }
  return node;
}

function deleteNode(node, key) {
  if (!node) return null;
  if (key < node.value) node.left = deleteNode(node.left, key);
  else if (key > node.value) node.right = deleteNode(node.right, key);
  else {
    if (!node.left || !node.right) {
      // one child or none
      let temp = node.left ? node.left : node.right;
      return temp;
    } else {
      // two children: inorder successor
      let succ = minValueNode(node.right);
      node.value = succ.value;
      node.right = deleteNode(node.right, succ.value);
    }
  }

  if (!node) return node;
  updateHeight(node);
  const balance = getBalance(node);

  // LL
  if (balance > 1 && getBalance(node.left) >= 0) return rightRotate(node);
  // LR
  if (balance > 1 && getBalance(node.left) < 0) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }
  // RR
  if (balance < -1 && getBalance(node.right) <= 0) return leftRotate(node);
  // RL
  if (balance < -1 && getBalance(node.right) > 0) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }
  return node;
}

// === Layout (in-order columns, depth rows; fits within viewBox) ===
function getTreeHeight(n) {
  if (!n) return 0;
  return 1 + Math.max(getTreeHeight(n.left), getTreeHeight(n.right));
}

function assignDepths(n, d) {
  if (!n) return;
  n._depth = d;
  assignDepths(n.left, d + 1);
  assignDepths(n.right, d + 1);
}

function inorderCollect(n, arr) {
  if (!n) return;
  inorderCollect(n.left, arr);
  arr.push(n);
  inorderCollect(n.right, arr);
}

function assignPositions(root) {
  if (!root) return;
  assignDepths(root, 0);
  const nodes = [];
  inorderCollect(root, nodes);
  const n = nodes.length;
  const height = getTreeHeight(root);

  const minX = CANVAS_PADDING + NODE_RADIUS;
  const maxX = CANVAS_WIDTH - (CANVAS_PADDING + NODE_RADIUS);
  const minY = CANVAS_PADDING + NODE_RADIUS;
  const maxY = CANVAS_HEIGHT - (CANVAS_PADDING + NODE_RADIUS);

  const availW = Math.max(1, maxX - minX);
  const availH = Math.max(1, maxY - minY);

  const xStep = availW / Math.max(1, n);
  const yStep = availH / Math.max(1, height);

  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    node.x = minX + (i + 0.5) * xStep;
    node.y = minY + (node._depth + 0.5) * yStep;
  }
}

// === Drawing (self-contained, edges first then nodes; reattach if detached) ===
function createOrUpdateElement(node) {
  if (!node.element) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    g.appendChild(c);
    g.appendChild(t);
    svg.appendChild(g);
    node.element = g;
  } else if (node.element.parentNode !== svg) {
    svg.appendChild(node.element);
  }

  const circle = node.element.querySelector("circle");
  const text = node.element.querySelector("text");

  circle.setAttribute("cx", node.x);
  circle.setAttribute("cy", node.y);
  circle.setAttribute("r", NODE_RADIUS);
  circle.setAttribute("fill", NODE_FILL);
  circle.setAttribute("stroke", EDGE_STROKE);
  circle.setAttribute("stroke-width", "2");

  text.setAttribute("x", node.x);
  text.setAttribute("y", node.y + 6);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "16");
  text.setAttribute("font-weight", "600");
  text.setAttribute("fill", TEXT_COLOR);
  text.textContent = node.value;
}

function drawEdges(node) {
  if (!node) return;
  const r = NODE_RADIUS;
  if (node.left) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", node.x);
    line.setAttribute("y1", node.y + r);
    line.setAttribute("x2", node.left.x);
    line.setAttribute("y2", node.left.y - r);
    line.setAttribute("stroke", EDGE_STROKE);
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
    drawEdges(node.left);
  }
  if (node.right) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", node.x);
    line.setAttribute("y1", node.y + r);
    line.setAttribute("x2", node.right.x);
    line.setAttribute("y2", node.right.y - r);
    line.setAttribute("stroke", EDGE_STROKE);
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
    drawEdges(node.right);
  }
}

function drawNodes(node) {
  if (!node) return;
  createOrUpdateElement(node);
  drawNodes(node.left);
  drawNodes(node.right);
}

// === Render ===
function render() {
  if (!svg) {
    console.error("SVG canvas not found");
    return;
  }
  clear(svg);
  svg.setAttribute("viewBox", `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
  if (root) {
    assignPositions(root);
    drawEdges(root);
    drawNodes(root);
  }
  statusEl.textContent = root ? `Status: ${getHeight(root)} levels` : "Status: Empty";
}

// === UI hooks ===
btnInsert.onclick = function() {
  const v = Number(input.value);
  if (!isNaN(v)) {
    root = insertNode(root, v);
    render();
    statusEl.textContent = `Inserted ${v} (${getHeight(root)} levels)`;
    input.value = "";
  } else {
    statusEl.textContent = "Invalid value";
  }
};

btnDelete.onclick = function() {
  const v = Number(input.value);
  if (!isNaN(v)) {
    root = deleteNode(root, v);
    render();
    statusEl.textContent = `Deleted ${v} (${getHeight(root)} levels)`;
    input.value = "";
  } else {
    statusEl.textContent = "Invalid value";
  }
};

btnReset.onclick = function() {
  root = null;
  render();
  statusEl.textContent = "Reset";
};

render();
