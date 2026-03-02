export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function random(min?: number, max?: number): number {
  if (min === undefined) return Math.random();
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
}

// Simple 2D Perlin noise (hash-based approximation)
const PERLIN_SIZE = 256;
const perm: number[] = [];

function initPerlin() {
  for (let i = 0; i < PERLIN_SIZE; i++) perm[i] = i;
  for (let i = PERLIN_SIZE - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < PERLIN_SIZE; i++) perm[PERLIN_SIZE + i] = perm[i];
}

initPerlin();

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return (h & 1 ? -u : u) + (h & 2 ? -v : v);
}

export function noise(x: number, y: number = 0): number {
  const xi = Math.floor(x) & (PERLIN_SIZE - 1);
  const yi = Math.floor(y) & (PERLIN_SIZE - 1);
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[xi] + yi];
  const ab = perm[perm[xi] + yi + 1];
  const ba = perm[perm[xi + 1] + yi];
  const bb = perm[perm[xi + 1] + yi + 1];

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);

  return (lerp(x1, x2, v) + 1) / 2; // normalize to 0-1
}
