const svg = document.getElementById("rbt-canvas");
const input = document.getElementById("rbt-input");
const statusEl = document.getElementById("rbt-status");
const btnInsert = document.getElementById("rbt-insert");
const btnDelete = document.getElementById("rbt-delete");
const btnReset = document.getElementById("rbt-reset");

if (!svg || !input || !statusEl || !btnInsert || !btnDelete || !btnReset) {
  console.error("One or more DOM elements not found. Check IDs in rbt-visualizer.html.");
}

const NODE_RADIUS = 34;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const CANVAS_PADDING = 60;
const COLOR_RED = "#D7263D";
const COLOR_BLACK = "#2A2D34";
const TEXT_COLOR = "#FFFFFF";

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

class Node {
  constructor(value, color = "RED") {
    this.value = value;
    this.color = color;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.x = 0;
    this.y = 0;
    this.element = null;
  }
}

let root = null;

function leftRotate(x) {
  const y = x.right;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
}

function rightRotate(y) {
  const x = y.left;
  y.left = x.right;
  if (x.right) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) root = x;
  else if (y === y.parent.left) y.parent.left = x;
  else y.parent.right = x;
  x.right = y;
  y.parent = x;
}

function insert(value) {
  const z = new Node(value, "RED");
  let y = null;
  let x = root;
  while (x) {
    y = x;
    if (z.value < x.value) x = x.left;
    else if (z.value > x.value) x = x.right;
    else return;
  }
  z.parent = y;
  if (!y) root = z;
  else if (z.value < y.value) y.left = z;
  else y.right = z;
  insertFixup(z);
}

function insertFixup(z) {
  while (z.parent && z.parent.color === "RED") {
    if (z.parent === z.parent.parent.left) {
      const y = z.parent.parent.right;
      if (y && y.color === "RED") {
        z.parent.color = "BLACK";
        y.color = "BLACK";
        z.parent.parent.color = "RED";
        z = z.parent.parent;
      } else {
        if (z === z.parent.right) {
          z = z.parent;
          leftRotate(z);
        }
        z.parent.color = "BLACK";
        z.parent.parent.color = "RED";
        rightRotate(z.parent.parent);
      }
    } else {
      const y = z.parent.parent.left;
      if (y && y.color === "RED") {
        z.parent.color = "BLACK";
        y.color = "BLACK";
        z.parent.parent.color = "RED";
        z = z.parent.parent;
      } else {
        if (z === z.parent.left) {
          z = z.parent;
          rightRotate(z);
        }
        z.parent.color = "BLACK";
        z.parent.parent.color = "RED";
        leftRotate(z.parent.parent);
      }
    }
  }
  if (root) root.color = "BLACK";
}

function transplant(u, v) {
  if (!u.parent) root = v;
  else if (u === u.parent.left) u.parent.left = v;
  else u.parent.right = v;
  if (v) v.parent = u.parent;
}

function treeMinimum(x) {
  while (x.left) x = x.left;
  return x;
}

function deleteValue(value) {
  let z = root;
  while (z && z.value !== value) {
    if (value < z.value) z = z.left;
    else z = z.right;
  }
  if (!z) return;

  let y = z;
  let yOriginalColor = y.color;
  let x;

  if (!z.left) {
    x = z.right;
    transplant(z, z.right);
  } else if (!z.right) {
    x = z.left;
    transplant(z, z.left);
  } else {
    y = treeMinimum(z.right);
    yOriginalColor = y.color;
    x = y.right;
    if (y.parent === z) {
      if (x) x.parent = y;
    } else {
      transplant(y, y.right);
      y.right = z.right;
      if (y.right) y.right.parent = y;
    }
    transplant(z, y);
    y.left = z.left;
    if (y.left) y.left.parent = y;
    y.color = z.color;
  }

  if (yOriginalColor === "BLACK") {
    deleteFixup(x, (x ? x.parent : null));
  }
}

function deleteFixup(x, parentHint) {
  while ((x !== root) && (!x || x.color === "BLACK")) {
    const xp = x ? x.parent : parentHint;
    if (!xp) break;
    if (x === xp.left) {
      let w = xp.right;
      if (w && w.color === "RED") {
        w.color = "BLACK";
        xp.color = "RED";
        leftRotate(xp);
        w = xp.right;
      }
      const wlc = w && w.left ? w.left.color : "BLACK";
      const wrc = w && w.right ? w.right.color : "BLACK";
      if ((!w) || (wlc === "BLACK" && wrc === "BLACK")) {
        if (w) w.color = "RED";
        x = xp;
      } else {
        if (wrc === "BLACK") {
          if (w && w.left) w.left.color = "BLACK";
          if (w) w.color = "RED";
          if (w) rightRotate(w);
          w = xp.right;
        }
        if (w) w.color = xp.color;
        xp.color = "BLACK";
        if (w && w.right) w.right.color = "BLACK";
        leftRotate(xp);
        x = root;
      }
    } else {
      let w = xp.left;
      if (w && w.color === "RED") {
        w.color = "BLACK";
        xp.color = "RED";
        rightRotate(xp);
        w = xp.left;
      }
      const wlc = w && w.left ? w.left.color : "BLACK";
      const wrc = w && w.right ? w.right.color : "BLACK";
      if ((!w) || (wlc === "BLACK" && wrc === "BLACK")) {
        if (w) w.color = "RED";
        x = xp;
      } else {
        if (wlc === "BLACK") {
          if (w && w.right) w.right.color = "BLACK";
          if (w) w.color = "RED";
          if (w) leftRotate(w);
          w = xp.left;
        }
        if (w) w.color = xp.color;
        xp.color = "BLACK";
        if (w && w.left) w.left.color = "BLACK";
        rightRotate(xp);
        x = root;
      }
    }
  }
  if (x) x.color = "BLACK";
  if (root) root.color = "BLACK";
}


function _collectNodes(node, arr = []) {
  if (!node) return arr;
  arr.push(node);
  _collectNodes(node.left, arr);
  _collectNodes(node.right, arr);
  return arr;
}

function fitPositionsToCanvas(root) {
  const nodes = _collectNodes(root);
  if (nodes.length === 0) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y);
  }
  const availW = CANVAS_WIDTH - 2*(CANVAS_PADDING + NODE_RADIUS);
  const availH = CANVAS_HEIGHT - 2*(CANVAS_PADDING + NODE_RADIUS);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const scale = Math.min(1, Math.min(availW/width, availH/height));
  for (const n of nodes) {
    n.x = (CANVAS_PADDING + NODE_RADIUS) + (n.x - minX) * scale;
    n.y = (CANVAS_PADDING + NODE_RADIUS) + (n.y - minY) * scale;
  }
}


function createOrUpdateElement(node) {
  if (!node.element) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    g.appendChild(c); g.appendChild(t);
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
  circle.setAttribute("fill", node.color === "RED" ? COLOR_RED : COLOR_BLACK);
  circle.setAttribute("stroke", COLOR_BLACK);
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
    line.setAttribute("stroke", COLOR_BLACK);
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
    line.setAttribute("stroke", COLOR_BLACK);
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



function getHeight(n) {
  if (!n) return 0;
  return 1 + Math.max(getHeight(n.left), getHeight(n.right));
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

/**
 * In-order layout:
 * - Do an in-order traversal to get nodes in sorted order.
 * - Horizontal positions are assigned by in-order index (guarantees left<parent<right).
 * - Vertical positions use depth-based rows.
 * - Uses a fixed 1200x800 viewBox with padding and NODE_RADIUS margins.
 */
function assignPositions(root) {
  if (!root) return {minX:0,maxX:0,minY:0,maxY:0};

  assignDepths(root, 0);
  const height = getHeight(root);
  const nodesInOrder = [];
  inorderCollect(root, nodesInOrder);
  const n = nodesInOrder.length;

  const minXPad = CANVAS_PADDING + NODE_RADIUS;
  const maxXPad = CANVAS_WIDTH - (CANVAS_PADDING + NODE_RADIUS);
  const minYPad = CANVAS_PADDING + NODE_RADIUS;
  const maxYPad = CANVAS_HEIGHT - (CANVAS_PADDING + NODE_RADIUS);

  const availW = Math.max(1, maxXPad - minXPad);
  const availH = Math.max(1, maxYPad - minYPad);

  const xStep = availW / Math.max(1, n);
  const yStep = availH / Math.max(1, height);

  for (let i = 0; i < n; i++) {
    const node = nodesInOrder[i];
    node.x = minXPad + (i + 0.5) * xStep;
    node.y = minYPad + (node._depth + 0.5) * yStep;
  }

  return {minX: minXPad, maxX: maxXPad, minY: minYPad, maxY: maxYPad};
}


function render() {
  if (!svg) return;
  clear(svg);
  svg.setAttribute("viewBox", `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
  if (root) {
    assignPositions(root);
    drawEdges(root);
    drawNodes(root);
  }
}

btnInsert.onclick = function() {
  const v = Number(input.value);
  if (!Number.isFinite(v)) {
    statusEl.textContent = "Invalid value";
    return;
  }
  insert(v);
  render();
  statusEl.textContent = `Inserted ${v} (${getHeight(root)} levels)`;
  input.value = "";
};

btnDelete.onclick = function() {
  const v = Number(input.value);
  if (!Number.isFinite(v)) {
    statusEl.textContent = "Invalid value";
    return;
  }
  deleteValue(v);
  render();
  statusEl.textContent = `Deleted ${v} (${getHeight(root)} levels)`;
  input.value = "";
};

btnReset.onclick = function() {
  root = null;
  render();
  statusEl.textContent = "Reset";
};

render();
