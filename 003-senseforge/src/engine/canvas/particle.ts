import type { Particle, ParticleOptions, ColorInput } from "../types";

const particles: Particle[] = [];
const MAX_PARTICLES = 2000;

export function emit(options: ParticleOptions) {
  const count = options.count ?? 1;
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    particles.push(createParticle(options));
  }
}

export function burst(options: ParticleOptions) {
  const count = options.count ?? 20;
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    particles.push(createParticle({ ...options, spread: options.spread ?? Math.PI * 2 }));
  }
}

export function update(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vy += p.gravity * dt;
    p.x += p.vx;
    p.y += p.vy;
  }
}

export function render(ctx: OffscreenCanvasRenderingContext2D) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    const size = p.size * alpha;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.glow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = size * 2;
    }

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function clear() {
  particles.length = 0;
}

export function getCount(): number {
  return particles.length;
}

function createParticle(options: ParticleOptions): Particle {
  const angle =
    (options.angle ?? 0) + (Math.random() - 0.5) * (options.spread ?? Math.PI * 2);
  const speed = resolveRange(options.speed ?? [1, 3]);
  const life = resolveRange(options.life ?? [0.5, 2]);
  const size = resolveRange(options.size ?? [2, 6]);

  return {
    x: options.x,
    y: options.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    life,
    maxLife: life,
    color: resolveColorInput(options.color ?? "#ffffff"),
    gravity: options.gravity ?? 0,
    glow: options.glow ?? false,
  };
}

function resolveRange(value: number | [number, number]): number {
  if (typeof value === "number") return value;
  return value[0] + Math.random() * (value[1] - value[0]);
}

function resolveColorInput(color: ColorInput | ColorInput[]): string {
  if (Array.isArray(color) && typeof color[0] !== "number") {
    const arr = color as ColorInput[];
    return resolveSingle(arr[Math.floor(Math.random() * arr.length)]);
  }
  return resolveSingle(color as ColorInput);
}

function resolveSingle(color: ColorInput): string {
  if (typeof color === "string") return color;
  if (typeof color === "number") {
    const c = Math.floor(color) & 0xff;
    return `rgb(${c},${c},${c})`;
  }
  if (Array.isArray(color)) {
    const [r, g, b, a] = color;
    return a !== undefined ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
  }
  return "#ffffff";
}
