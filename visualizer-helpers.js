function clear(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function drawNode(svg, centerX, centerY, label, fill) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", centerX);
  circle.setAttribute("cy", centerY);
  circle.setAttribute("r", "22");
  circle.setAttribute("fill", fill || "#8BC34A");
  circle.setAttribute("stroke", "#2A2D34");
  circle.setAttribute("stroke-width", "2");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", centerX);
  text.setAttribute("y", centerY + 5);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "14");
  text.setAttribute("fill", "#2A2D34");
  text.textContent = label;

  g.appendChild(circle);
  g.appendChild(text);
  svg.appendChild(g);
}