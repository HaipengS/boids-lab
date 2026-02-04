# Boids Lab — Interactive Flocking Simulation

**Live Demo**  
👉 https://haipengs.github.io/boids-lab/

Boids Lab is an interactive, web-based simulation of flocking behavior based on the
classic Boids model. The project explores how complex collective motion emerges from
simple local interaction rules, and provides real-time controls and metrics for
experimental exploration.

This project is implemented entirely in vanilla JavaScript using HTML5 Canvas and is
designed as an experimental playground for studying emergence in agent-based systems.

---

## Features

### Core Boids Model
Each agent (boid) follows three local interaction rules:

- **Separation** — steer away from nearby neighbors to avoid collisions  
- **Alignment** — match velocity with nearby neighbors  
- **Cohesion** — move toward the local center of mass  

These simple rules, when applied locally, give rise to realistic flocking behavior
at the global level.

---

### Interactive Controls
The simulation supports real-time parameter tuning:

- Number of boids
- Vision radius (neighbor detection range)
- Separation (avoidance) radius
- Maximum speed and steering force
- Independent weights for separation, alignment, and cohesion
- Pause / resume and reset controls

All changes take effect immediately, enabling rapid experimentation.

---

### Predator Interaction
A mouse-controlled **predator** introduces an external disturbance:

- Boids within a fear radius apply an avoidance force
- The flock scatters when the predator approaches and later reforms
- Fear strength and radius are fully adjustable

This extension demonstrates how external threats influence collective dynamics.

---

### Quantitative Metrics
In addition to visualization, the simulation computes real-time metrics:

- **Polarization** — measures directional alignment of the flock  
  - Values near 1 indicate highly ordered motion  
  - Lower values indicate disordered or scattered states
- **FPS** — smoothed frame rate indicator

These metrics allow qualitative observations to be paired with quantitative analysis.

---

## Implementation Overview

- **Rendering:** HTML5 Canvas (2D)
- **Architecture:** Modular ES6 design
  - `boid.js` — agent state and integration
  - `forces.js` — separation, alignment, cohesion forces
  - `metrics.js` — polarization and performance metrics
  - `main.js` — simulation loop and UI wiring
- **Neighbor Search:** Naive O(n²) approach (sufficient for current scale)
- **Deployment:** GitHub Pages (static hosting)

The simulation uses wrap-around boundary conditions and frame-rate–independent
integration.

---

## Project Motivation

This project was built to study **emergence in distributed systems**, where
complex global behavior arises from simple local rules without centralized control.

The interactive design emphasizes:
- Intuition over black-box behavior
- Experimentation through parameter tuning
- Clear separation between model logic and visualization

---

## References & Inspiration

- Craig Reynolds, *Flocks, Herds, and Schools: A Distributed Behavioral Model* (1987)
- Educational resources:
  - https://eater.net/boids
  - http://www.kfish.org/boids/pseudocode.html


