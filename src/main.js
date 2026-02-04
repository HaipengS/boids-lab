import { Boid } from "./boid.js";
import { separation, alignment, cohesion } from "./forces.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// UI elements
const el = (id) => document.getElementById(id);

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

const toggleBtn = el("toggle");
const resetBtn = el("reset");

// State
let boids = [];
let running = true;
let lastT = performance.now();

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
}

function resetWorld() {
  const { width, height } = resizeCanvasToDisplaySize();
  const n = Number(boidsCountEl.value);
  boids = makeBoids(n, width, height);
}

// naive neighbor search (O(n^2)) — good for Milestone 2
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

function tick(now) {
  const { width, height } = resizeCanvasToDisplaySize();

  // dt in seconds, clamp to avoid huge jumps
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  // background
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(229, 231, 235, 0.9)";

  if (running) {
    const visionRadius = Number(visionRadiusEl.value);
    const avoidRadius = Number(avoidRadiusEl.value);
    const maxSpeed = Number(maxSpeedEl.value);
    const maxForce = Number(maxForceEl.value);

    const wSep = Number(wSepEl.value);
    const wAli = Number(wAliEl.value);
    const wCoh = Number(wCohEl.value);

    // 1) compute forces based on current positions/velocities
    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      const neigh = neighborsOf(i, visionRadius);

      const fSep = separation(b, neigh, avoidRadius, maxSpeed, maxForce);
      const fAli = alignment(b, neigh, maxSpeed, maxForce);
      const fCoh = cohesion(b, neigh, maxSpeed, maxForce);

      b.applyForce({ x: fSep.x * wSep, y: fSep.y * wSep });
      b.applyForce({ x: fAli.x * wAli, y: fAli.y * wAli });
      b.applyForce({ x: fCoh.x * wCoh, y: fCoh.y * wCoh });
    }

    // 2) integrate
    // Use dt*60 to keep “feel” stable as in previous milestone
    const stepDt = dt * 60;
    for (const b of boids) {
      b.step(stepDt, width, height, maxSpeed);
    }
  }

  // draw
  for (const b of boids) b.draw(ctx);

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

// When user changes boids count, rebuild immediately (feels better)
boidsCountEl.addEventListener("change", () => resetWorld());

// Init
window.addEventListener("resize", () => resetWorld());
syncLabels();
resetWorld();
requestAnimationFrame(tick);
