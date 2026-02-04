export function v(x = 0, y = 0) {
  return { x, y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function mul(a, k) {
  return { x: a.x * k, y: a.y * k };
}

export function div(a, k) {
  return k === 0 ? { x: 0, y: 0 } : { x: a.x / k, y: a.y / k };
}

export function mag2(a) {
  return a.x * a.x + a.y * a.y;
}

export function mag(a) {
  return Math.sqrt(mag2(a));
}

export function norm(a) {
  const m = mag(a);
  return m === 0 ? { x: 0, y: 0 } : { x: a.x / m, y: a.y / m };
}

export function limit(a, max) {
  const m2 = mag2(a);
  const mx2 = max * max;
  if (m2 <= mx2) return a;
  const m = Math.sqrt(m2);
  const k = max / m;
  return { x: a.x * k, y: a.y * k };
}
