# 09 — Tempus / Time Architecture

## Current state

No canonical Tempus object exists. Time is split across:

- `animTime` (runtime, reset on rebuild)
- PlayCanvas app `dt`
- `timelineClock` state and `getTimelineTime()`
- `frame.time` for post
- RD `time`/`dt` and step count
- physics step
- TAA frame history
- post history frames

Timeline is a project-level state with duration/loop/keyframes; it is not the same as artistic time. RD and physics are not driven by timeline time consistently.

## Recommended architecture

```text
Tempus
  renderClock: fixed frame cadence, never used for art
  artClock: canonical seconds/phase/delta, pausable, loopable, rate/offset
  simClock: fixed-step accumulator for RD/physics, can run faster/slower
  timelineClock: derives from artClock or independent performance timeline
  feedbackClock: frame index + generation, not wall time
```

Consumers read explicit domains, never global wall time.

## Requirements

- Rate, offset, phase, loop, direction, pause.
- Quantize/smooth/slew.
- Deterministic seed and step count.
- Stateful systems: checkpoints/snapshots with explicit reset reasons.
- Replay: config + seed + clock parameters + checkpoint.
- Branching: clone temporal state or start from config-only.

## Reproducibility levels

A. Same configuration: graph/params/shaders/seed.
B. Same current visual state: config + RD/post/TAA/physics/checkpoint textures.
C. Same future evolution: A + B + deterministic clock/step + PRNG state.

Do not pretend B/C works from JSON config alone.

## Stateful systems

- RD: checkpoint texture; config-only continuation is acceptable but not exact.
- Post feedback: checkpoint history or reset to current scene.
- TAA: checkpoint history or reset.
- Physics: serialized body state/integrator state; otherwise reset.
- Spring: per-object state.

## MVP

CORE: one art clock with pause/rate/offset; fixed-step simulation clock; explicit reset policy per stateful subsystem.
NEAR-TERM: loop/phase, temporal checkpoint capture for RD/post.
EXPERIMENTAL: reverse time, temporal branch trees, full deterministic replay.
