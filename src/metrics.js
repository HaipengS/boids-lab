import { mag, norm, add, div } from "./vec2.js";

export function computePolarization(boids) {
  // Polarization = magnitude of average normalized velocity vector
  // Range ~ [0, 1]
  if (boids.length === 0) return 0;

  let sum = { x: 0, y: 0 };
  let count = 0;

  for (const b of boids) {
    const s = mag(b.vel);
    if (s > 1e-8) {
      sum = add(sum, norm(b.vel));
      count++;
    }
  }

  if (count === 0) return 0;

  const avg = div(sum, count);
  return Math.min(1, mag(avg));
}

export function makeFpsCounter() {
  let last = performance.now();
  let ema = 60; // start guess
  const alpha = 0.12; // smoothing

  return function updateFps(now = performance.now()) {
    const dt = now - last;
    last = now;
    if (dt <= 0) return ema;
    const fps = 1000 / dt;
    ema = ema * (1 - alpha) + fps * alpha;
    return ema;
  };
}
