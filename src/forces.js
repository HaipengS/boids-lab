import { v, add, sub, mul, div, mag, norm, limit } from "./vec2.js";

// dist2 helper
function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

// steer: desiredVel - currentVel, then limit by maxForce
function steerToward(desiredVel, currentVel, maxForce) {
  const steer = sub(desiredVel, currentVel);
  return limit(steer, maxForce);
}

export function separation(boid, neighbors, avoidRadius, maxSpeed, maxForce) {
  // push away from too-close neighbors (weighted by inverse distance)
  const r2 = avoidRadius * avoidRadius;
  let sum = v(0, 0);
  let count = 0;

  for (const other of neighbors) {
    const d2 = dist2(boid.pos, other.pos);
    if (d2 > 0 && d2 < r2) {
      const away = sub(boid.pos, other.pos);
      // stronger when closer
      sum = add(sum, div(away, Math.max(1e-6, d2)));
      count++;
    }
  }

  if (count === 0) return v(0, 0);

  const desired = mul(norm(sum), maxSpeed);
  return steerToward(desired, boid.vel, maxForce);
}

export function alignment(boid, neighbors, maxSpeed, maxForce) {
  // match average neighbor velocity
  let avg = v(0, 0);
  let count = 0;

  for (const other of neighbors) {
    avg = add(avg, other.vel);
    count++;
  }
  if (count === 0) return v(0, 0);

  avg = div(avg, count);
  const desired = mul(norm(avg), maxSpeed);
  return steerToward(desired, boid.vel, maxForce);
}

export function cohesion(boid, neighbors, maxSpeed, maxForce) {
  // move toward average neighbor position (center of mass)
  let center = v(0, 0);
  let count = 0;

  for (const other of neighbors) {
    center = add(center, other.pos);
    count++;
  }
  if (count === 0) return v(0, 0);

  center = div(center, count);
  const toCenter = sub(center, boid.pos);
  const desired = mul(norm(toCenter), maxSpeed);
  return steerToward(desired, boid.vel, maxForce);
}
