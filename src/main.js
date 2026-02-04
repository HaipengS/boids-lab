import { Boid } from "./boid.js";
import { separation, alignment, cohesion } from "./forces.js";
import { computePolarization, makeFpsCounter } from "./metrics.js";
import { sub, mag, norm, mul, limit } from "./vec2.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// UI helper
const el = (id) => document.getElementById(id);

// Sliders / controls
const boidsCountEl = el("boidsCount");
const boidsCountValEl = el("boidsCountVal");

const visionRadiusEl = el("visionRadius");
const visionRadiusValEl = el("visionRadiusVal");

const avoidRadiusEl = el("avoidRadius");
const avoidRadiusValEl = el("avoidRadiusVal");

const maxSpeedEl = el("maxSpeed");
const maxSpeedValEl = el("maxSpeedVal");

const maxForceEl = el("maxForce");
const maxForceValEl = el("maxForceVal");

const wSepEl = el("wSep");
const wSepValEl = el("wSepVal");
const wAliEl = el("wAli");
const wAliValEl = el("wAliVal");
const wCohEl = el("wCoh");
const wCohValEl = el("wCohVal");

const predEnabledEl = el("predEnabled");
const fearRadiusEl = el("fearRadius");
const fearRadiusValEl = el("fearRadiusVal");
const fearWeightEl = el("fearWeight");
const fearWeightValEl = el("fearWeightVal");

const toggleBtn = el("toggle");
const resetBtn = el("reset");

// Metrics UI
const fpsEl = el("fps");
const polEl = el("pol");

// State
let boids = [];
let running = true;
let lastT = performance.now();
const fpsCounter = makeFpsCounter();

// Predator state (mouse-controlled)
const predator = {
  x: 0,
  y: 0,
  active: true,
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function resizeCanvasToDisplaySize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(10, Math.floor(rect.width * dpr));
  const h = Math.max(10, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: rect.width, height: rect.height };
}

function makeBoids(n, width, height) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const x = rand(0, width);
    const y = rand(0, height);
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.6, 2.4);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    list.push(new Boid(x, y, vx, vy));
  }
  return list;
}

function syncLabels() {
  boidsCountValEl.textContent = String(boidsCountEl.value);

  visionRadiusValEl.textContent = String(visionRadiusEl.value);
  avoidRadiusValEl.textContent = String(avoidRadiusEl.value);

  maxSpeedValEl.textContent = String(maxSpeedEl.value);
  maxForceValEl.textContent = String(maxForceEl.value);

  wSepValEl.textContent = String(wSepEl.value);
  wAliValEl.textContent = String(wAliEl.value);
  wCohValEl.textContent = String(wCohEl.value);

  fearRadiusValEl.textContent = String(fearRadiusEl.value);
  fearWeightValEl.textContent = String(fearWeightEl.value);
}

function resetWorld() {
  const { width, height } = resizeCanvasToDisplaySize();
  const n = Number(boidsCountEl.value);
  boids = makeBoids(n, width, height);

  // put predator in center initially
  predator.x = width / 2;
  predator.y = height / 2;
}

function neighborsOf(i, visionRadius) {
  const b = boids[i];
  const r2 = visionRadius * visionRadius;
  const neigh = [];
  for (let j = 0; j < boids.length; j++) {
    if (j === i) continue;
    const o = boids[j];
    const dx = b.pos.x - o.pos.x;
    const dy = b.pos.y - o.pos.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < r2) neigh.push(o);
  }
  return neigh;
}

// Predator flee force (non-periodic, simple & strong visually)
function predatorFleeForce(boid, maxSpeed, maxForce) {
  if (!predEnabledEl.checked) return { x: 0, y: 0 };

  const fearR = Number(fearRadiusEl.value);
  const dx = boid.pos.x - predator.x;
  const dy = boid.pos.y - predator.y;
  const d2 = dx * dx + dy * dy;
  const r2 = fearR * fearR;

  if (d2 <= 0 || d2 > r2) return { x: 0, y: 0 };

  // Direction away from predator, stronger when closer
  const away = { x: dx, y: dy };
  const dir = norm(away);
  const dist = Math.sqrt(d2);

  // scale 0..1 (1 when very close)
  const intensity = 1 - dist / fearR;

  // desired velocity away
  const desired = mul(dir, maxSpeed);

  // steering = desired - current
  const steer = sub(desired, boid.vel);

  // cap by maxForce, then scale by intensity
  const capped = limit(steer, maxForce);
  return mul(capped, intensity);
}

function drawPredator() {
  if (!predEnabledEl.checked) return;

  // predator as a ring + filled dot
  ctx.save();
  ctx.strokeStyle = "rgba(239, 68, 68, 0.55)";
  ctx.fillStyle = "rgba(239, 68, 68, 0.85)";

  const fearR = Number(fearRadiusEl.value);

  ctx.beginPath();
  ctx.arc(predator.x, predator.y, fearR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(predator.x, predator.y, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function tick(now) {
  const { width, height } = resizeCanvasToDisplaySize();

  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  // background
  ctx.clearRect(0, 0, width, height);

  // metrics
  const fps = fpsCounter(now);
  fpsEl.textContent = fps.toFixed(0);

  // draw style
  ctx.fillStyle = "rgba(229, 231, 235, 0.9)";

  if (running) {
    const visionRadius = Number(visionRadiusEl.value);
    const avoidRadius = Number(avoidRadiusEl.value);
    const maxSpeed = Number(maxSpeedEl.value);
    const maxForce = Number(maxForceEl.value);

    const wSep = Number(wSepEl.value);
    const wAli = Number(wAliEl.value);
    const wCoh = Number(wCohEl.value);
    const wFear = Number(fearWeightEl.value);

    // 1) compute forces
    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      const neigh = neighborsOf(i, visionRadius);

      const fSep = separation(b, neigh, avoidRadius, maxSpeed, maxForce);
      const fAli = alignment(b, neigh, maxSpeed, maxForce);
      const fCoh = cohesion(b, neigh, maxSpeed, maxForce);

      const fFear = predatorFleeForce(b, maxSpeed, maxForce);

      b.applyForce({ x: fSep.x * wSep, y: fSep.y * wSep });
      b.applyForce({ x: fAli.x * wAli, y: fAli.y * wAli });
      b.applyForce({ x: fCoh.x * wCoh, y: fCoh.y * wCoh });
      b.applyForce({ x: fFear.x * wFear, y: fFear.y * wFear });
    }

    // 2) integrate
    const stepDt = dt * 60;
    for (const b of boids) {
      b.step(stepDt, width, height, maxSpeed);
    }
  }

  // draw boids
  for (const b of boids) b.draw(ctx);

  // compute polarization AFTER movement (more intuitive)
  const pol = computePolarization(boids);
  polEl.textContent = pol.toFixed(2);

  // draw predator on top
  drawPredator();

  requestAnimationFrame(tick);
}

// UI events
[
  boidsCountEl,
  visionRadiusEl,
  avoidRadiusEl,
  maxSpeedEl,
  maxForceEl,
  wSepEl,
  wAliEl,
  wCohEl,
  fearRadiusEl,
  fearWeightEl,
].forEach((x) =>
  x.addEventListener("input", () => {
    syncLabels();
  })
);

toggleBtn.addEventListener("click", () => {
  running = !running;
  toggleBtn.textContent = running ? "Pause" : "Resume";
});

resetBtn.addEventListener("click", () => {
  resetWorld();
});

boidsCountEl.addEventListener("change", () => resetWorld());

window.addEventListener("resize", () => resetWorld());

// Mouse controls predator position
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  predator.x = e.clientX - rect.left;
  predator.y = e.clientY - rect.top;
});

syncLabels();
resetWorld();
requestAnimationFrame(tick);
