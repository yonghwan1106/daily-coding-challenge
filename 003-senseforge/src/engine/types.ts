export interface Vec2 {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type ColorInput = string | number | [number, number, number, number?];

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParticleOptions {
  x: number;
  y: number;
  count?: number;
  color?: ColorInput | ColorInput[];
  size?: number | [number, number];
  speed?: number | [number, number];
  life?: number | [number, number];
  gravity?: number;
  glow?: boolean;
  spread?: number;
  angle?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  gravity: number;
  glow: boolean;
}
