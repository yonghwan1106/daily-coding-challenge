/**
 * Canvas 2D drawing primitives.
 * These functions are injected into the sandbox as global functions.
 */

let _ctx: OffscreenCanvasRenderingContext2D | null = null;
let _fillColor = "#ffffff";
let _strokeColor = "#ffffff";
let _strokeW = 1;
let _doFill = true;
let _doStroke = true;

export function bindContext(ctx: OffscreenCanvasRenderingContext2D) {
  _ctx = ctx;
  resetStyle();
}

export function resetStyle() {
  _fillColor = "#ffffff";
  _strokeColor = "#ffffff";
  _strokeW = 1;
  _doFill = true;
  _doStroke = true;
}

export function background(color: string | number) {
  if (!_ctx) return;
  const c = resolveColor(color);
  _ctx.save();
  _ctx.resetTransform();
  _ctx.fillStyle = c;
  _ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
  _ctx.restore();
}

export function fill(color: string | number) {
  _fillColor = resolveColor(color);
  _doFill = true;
}

export function noFill() {
  _doFill = false;
}

export function stroke(color: string | number) {
  _strokeColor = resolveColor(color);
  _doStroke = true;
}

export function noStroke() {
  _doStroke = false;
}

export function strokeWeight(w: number) {
  _strokeW = w;
}

export function circle(x: number, y: number, r: number) {
  if (!_ctx) return;
  _ctx.beginPath();
  _ctx.arc(x, y, r, 0, Math.PI * 2);
  applyFillStroke();
}

export function rect(x: number, y: number, w: number, h: number) {
  if (!_ctx) return;
  _ctx.beginPath();
  _ctx.rect(x, y, w, h);
  applyFillStroke();
}

export function line(x1: number, y1: number, x2: number, y2: number) {
  if (!_ctx) return;
  _ctx.beginPath();
  _ctx.moveTo(x1, y1);
  _ctx.lineTo(x2, y2);
  _ctx.strokeStyle = _strokeColor;
  _ctx.lineWidth = _strokeW;
  _ctx.stroke();
}

export function ellipse(
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation = 0,
) {
  if (!_ctx) return;
  _ctx.beginPath();
  _ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  applyFillStroke();
}

export function triangle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) {
  if (!_ctx) return;
  _ctx.beginPath();
  _ctx.moveTo(x1, y1);
  _ctx.lineTo(x2, y2);
  _ctx.lineTo(x3, y3);
  _ctx.closePath();
  applyFillStroke();
}

export function push() {
  _ctx?.save();
}

export function pop() {
  _ctx?.restore();
}

export function translate(x: number, y: number) {
  _ctx?.translate(x, y);
}

export function rotate(angle: number) {
  _ctx?.rotate(angle);
}

export function scale(x: number, y?: number) {
  _ctx?.scale(x, y ?? x);
}

function applyFillStroke() {
  if (!_ctx) return;
  if (_doFill) {
    _ctx.fillStyle = _fillColor;
    _ctx.fill();
  }
  if (_doStroke) {
    _ctx.strokeStyle = _strokeColor;
    _ctx.lineWidth = _strokeW;
    _ctx.stroke();
  }
}

function resolveColor(color: string | number): string {
  if (typeof color === "number") {
    const c = Math.floor(color) & 0xff;
    return `rgb(${c},${c},${c})`;
  }
  return color;
}
