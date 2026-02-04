import { v, add, sub, mul, mag, norm, limit } from "./vec2.js";

export class Boid {
  constructor(x, y, vx, vy) {
    this.pos = v(x, y);
    this.vel = v(vx, vy);
    this.acc = v(0, 0);
  }

  applyForce(f) {
    this.acc = add(this.acc, f);
  }

  step(dt, width, height, maxSpeed) {
    // integrate
    this.vel = add(this.vel, this.acc);
    this.vel = limit(this.vel, maxSpeed);
    this.pos = add(this.pos, mul(this.vel, dt));

    // reset acceleration each frame
    this.acc = v(0, 0);

    // wrap-around
    if (this.pos.x < 0) this.pos.x += width;
    if (this.pos.x >= width) this.pos.x -= width;
    if (this.pos.y < 0) this.pos.y += height;
    if (this.pos.y >= height) this.pos.y -= height;
  }

  draw(ctx) {
    // draw a small triangle pointing along velocity
    const speed = mag(this.vel);
    const dir = speed === 0 ? v(1, 0) : norm(this.vel);

    // size scales slightly with speed (kept subtle)
    const size = 6;

    // triangle points in local space
    // p0 = forward, p1/p2 = back corners
    const p0 = mul(dir, size);
    const left = { x: -dir.y, y: dir.x };
    const p1 = add(mul(dir, -size * 0.7), mul(left, size * 0.5));
    const p2 = add(mul(dir, -size * 0.7), mul(left, -size * 0.5));

    ctx.beginPath();
    ctx.moveTo(this.pos.x + p0.x, this.pos.y + p0.y);
    ctx.lineTo(this.pos.x + p1.x, this.pos.y + p1.y);
    ctx.lineTo(this.pos.x + p2.x, this.pos.y + p2.y);
    ctx.closePath();
    ctx.fill();
  }
}
