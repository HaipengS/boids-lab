import { Boid } from "./boid.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// UI elements
const boidsCountEl = document.getElementById("boidsCount");
const boidsCountValEl = document.getElementById("boidsCountVal");
const maxSpeedEl = document.getElementById("maxSpeed");
const maxSpeedValEl = document.getElementById("maxSpeedVal");
const toggleBtn = document.getElementById("toggle");
const resetBtn = document.getElementById("reset");

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
  //
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: rect.width, height: rect.height };
}

function makeBoids(n, width, height) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const x = rand(0, width);
    const y = rand(0, height);
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.4, 2.2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    list.push(new Boid(x, y, vx, vy));
  }
  return list;
}

function syncLabels() {
  boidsCountValEl.textContent = String(boidsCountEl.value);
  maxSpeedValEl.textContent = String(maxSpeedEl.value);
}

function resetWorld() {
  const { width, height } = resizeCanvasToDisplaySize();
  const n = Number(boidsCountEl.value);
  boids = makeBoids(n, width, height);
}

function tick(now) {
  const { width, height } = resizeCanvasToDisplaySize();

  // dt 用秒，限制最大 dt 防止切回窗口时跳太大
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  // background
  ctx.clearRect(0, 0, width, height);

  // draw style
  ctx.fillStyle = "rgba(229, 231, 235, 0.9)";

  if (running) {
    const maxSpeed = Number(maxSpeedEl.value);
    for (const b of boids) {
      b.step(dt * 60, width, height, maxSpeed); // 乘 60 让速度更像“每帧”
    }
  }

  for (const b of boids) b.draw(ctx);

  requestAnimationFrame(tick);
}

// UI events
boidsCountEl.addEventListener("input", () => {
  syncLabels();
});

maxSpeedEl.addEventListener("input", () => {
  syncLabels();
});

toggleBtn.addEventListener("click", () => {
  running = !running;
  toggleBtn.textContent = running ? "Pause" : "Resume";
});

resetBtn.addEventListener("click", () => {
  resetWorld();
});

// Init
window.addEventListener("resize", () => resetWorld());

syncLabels();
resetWorld();
requestAnimationFrame(tick);
