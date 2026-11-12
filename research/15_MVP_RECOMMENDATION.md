# 15 — MVP Recommendation

## Core question

What is the smallest coherent RE that demonstrates its fundamental idea?

> The user creates conditions from which a self-organizing visual form emerges, then steers, mutates and keeps what appears.

## Core MVP

### 1. One stage / one organism
- One scene with a small set of primitives or imported GLBs.
- One shared Look per object group.
- One active simulation (RD) with a small preset set.
- One explicit post/feedback stage.
- One mutation loop.

### 2. One visual field pipeline
- RD source → scalar/mask/gradient/normal/vector.
- One GPU deformation consumer (surface/vertex).
- One material consumer (emission/opacity/roughness/base color).
- One post consumer (distortion/feedback).
- No CPU readback for spatial fields; one global scalar sample only.

### 3. One time model
- Art clock: play/pause, rate, phase, one loop.
- Simulation clock: fixed step.
- Render TAA/feedback separate.
- Timeline is optional and derives from art clock.

### 4. One mutation loop
- MUTATE with depth.
- KEEP / AGAIN / REVERT / BRANCH.
- Stable seed, internal diff, compact history.
- No parameter explanation in normal mode.

### 5. One working editor shell
- 3D viewport, object selection, transform, material/Look, post stack.
- Cut or hide: plan editor, DMX/power/patch, legacy rig catalog, Timeline editing depth, graph editor depth, Shader Lab advanced editing if it threatens stability.
- Keep the plan/rig code only if the product identity is stage planning; do not keep both products half-alive.

### 6. Reliable runtime lifecycle
- Project switch in one runtime.
- Explicit RD/post/TAA/physics cleanup.
- No legacy Three.js stack.
- One pointer owner.

### 7. Save/export
- Project JSON.
- One runtime export/capture (config + checkpoint if possible).
- No full editor in runtime bundle.

## Near-term

- Additional RD outputs/one contrasting simulation (Physarum or Lenia) behind a field interface.
- Shared Look graph mutation.
- Checkpoint capture for RD/post.
- Audio input.
- Adaptive quality profiles.
- Runtime embed mode.

## Experimental lab

- Multi-species RD, NCA, differential growth, particle-life, physics→field ecosystems.
- Graph topology mutation.
- Temporal branching/replay.
- WebGPU compute backend.

## Later

- Multi-organism ecosystems.
- Live DMX/OSC/MIDI ecosystem.
- Marketplace/shared seeds.
- Multi-user collaboration.

## Reject for MVP

- General-purpose 3D modeling.
- General-purpose node graph editor.
- Full DMX/power certification tool.
- Feature parity with TouchDesigner/Houdini.
- Physically accurate light simulation.
- Arbitrary shader language editing as a primary workflow.
- Automatic aesthetic optimization.

## MVP boundary test

If a feature does not help the user create, steer, observe, mutate or preserve an evolving visual system, it does not belong in the MVP.

## Hard decisions required

1. Is RE a **stage/lighting planner** (RE:GRID) or a **self-organizing visual instrument** (RE:MORPH)?
2. Does the MVP keep the plan editor and rig catalog, or hide them behind an advanced mode?
3. Is Shared Look the primary ownership unit?
4. Is the first runtime target a website/installation, or an editor-only prototype?
