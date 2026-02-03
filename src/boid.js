export class Boid {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  // Speed limiting to maxSpeed
  limitSpeed(maxSpeed) {
    const s2 = this.vx * this.vx + this.vy * this.vy;
    const ms2 = maxSpeed * maxSpeed;
    if (s2 > ms2) {
      const s = Math.sqrt(s2);
      const k = maxSpeed / s;
      this.vx *= k;
      this.vy *= k;
    }
  }

  step(dt, width, height, maxSpeed) {
    this.limitSpeed(maxSpeed);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // wrap-around 
    if (this.x < 0) this.x += width;
    if (this.x >= width) this.x -= width;
    if (this.y < 0) this.y += height;
    if (this.y >= height) this.y -= height;
  }

  draw(ctx) {
    // Draw boid as a circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
