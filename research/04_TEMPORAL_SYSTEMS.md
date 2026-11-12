# 04 — Temporal and Stateful Systems

## Clocks found

| Clock | Source | Used by | Persistent | Notes |
| --- | --- | --- | --- | --- |
| `animTime` | Runtime increments by clamped `dt` in `applyModifiers` | motion modifiers, shader `uEffectTime`, RD update time, post? | no | Stops/changes with runtime rebuild; reset to 0 in `rebuild`. |
| App update `dt` | PlayCanvas app loop | physics, RD, timeline | no | Browser/throttling dependent. |
| `getTimelineTime()` | `lib/timelineClock.ts` | timeline sampling, post `sampleTimeline` | likely no | Timeline ranges; paused/loop behavior. |
| Timeline state | `Project.timeline` | keyframes, effect groups | yes | `time` likely runtime. |
| Renderer frame time | `frame.time` / performance | post `uTime`, `uFrame` | no | Derived from PlayCanvas frame. |
| RD step time | `animTime + dt` and `config.speed/timeStep` | Gray-Scott | GPU state no | Step count not wall-clock exact. |
| TAA time | CameraFrame | TAA jitter/history | no | Reset events tracked. |
| Physics | cannon-es world step | collisions/motion | no | Not saved; project switching leakage risk. |
| Post history | `RendererPostEffect` | feedback/temporal passes | no | Reset tokens. |
| Mutation time | date/seed | mutation records | yes | Not a playback clock. |

No single canonical artistic clock exists. The same visual frame can read `animTime`, timeline time and `frame.time`, which are not guaranteed synchronized.

## Stateful systems

- RD ping-pong textures (`ReactionDiffusionRuntime`).
- Post previous-frame history (`RendererPostEffect.historyTargets`).
- TAA history (CameraFrame).
- Physics world and physics signal decay (`cannon-es`, `physics.ts`).
- Spring motion state (`springStates`).
- Radial clones (runtime entities).
- Camera damping (CameraControls).
- Hover/selection/marker state.
- `sampleCache` for RD readback.
- Mutation lineage (`Project.mutation`).
- Material shader targets and clone materials.

## Lifecycle facts

- `PlayCanvasRuntime.rebuild()` calls `resetTaaHistory('renderer-recreation')`, clears `animatedModifierIds`, `radialClones`, `shaderEffectTargets`, `materialTargets`, and resets `animTime = 0`.
- `rebuild()` does **not** reset RD or destroy `postEffect`.
- `resetTaaHistory` toggles `taa.enabled` and calls `cameraFrame.update()`; this is a CameraFrame rebuild, not a dedicated history reset.
- Post reset tokens are per pass; stack-wide reset increments all tokens.
- RD reset occurs on resolution change, seed change or explicit `resetToken`; feed/kill do not reset.
- Physics world is rebuilt on geometry signature change; bodies/state lost.
- Mode switch plan↔3D destroys the entire app/device and recreates it; all temporal state is lost.
- Project switch in 3D calls `setProject`; if geometry signature differs, world rebuild; if not, fast path. Runtime/simulation state may leak across projects if not explicitly reset.

## Temporal bugs and risks

1. **Renderer “magic refresh”**: Haze changes `applyFog` signature and triggers `cameraFrame.update()`. Historically this repaired post/black issues. The current architecture still uses signature-triggered CameraFrame updates; post and post-history are not independently observable.
2. **History initialization**: Post first frame falls back to source texture, then copy pass writes history. Any copy failure yields stale/garbage feedback.
3. **TAA reset overreach**: world rebuild for a shader assignment resets TAA history even though only a material should change.
4. **RD state on project switch**: RD config resetToken may be same across projects; textures from project A may bleed into project B until resolution/seed/token differs. `RD.update` does not know project identity.
5. **RD readback cache**: `sampleOutput` binds raw FBO and reads 3×3 synchronously; cache is cleared each `update`. If called before update after a project switch, stale texture may be sampled.
6. **Post history on pass failure/reorder**: stack index mapping is fragile.
7. **Time domains**: no deterministic mapping between timeline time, animation time and simulation time; mutation/checkpoint cannot reproduce "same future evolution" without more clocks/state.

## Recommendations

- Introduce a `ClockDomain`/`Tempus` object with explicit render, artistic, simulation, physics and timeline rates; derive all consumers from it.
- Fix simulation stepping (fixed step + accumulator) for reproducibility; render interpolation separate.
- Treat RD, post history, TAA, physics and spring state as explicit `TemporalResource` objects with owner, reset policy and project/session scoping.
- Add project identity to RD runtime; reset/allocate on project switch unless a checkpoint is explicitly loaded.
- Replace TAA reset-by-toggle with an explicit history invalidation if PlayCanvas exposes one; otherwise isolate the rebuild.
- Add a `history generation` token and invalidate all consumers atomically on resize/reorder/project switch.

## MVP classification

CORE MVP: explicit reset/invalidate boundaries; canonical artistic clock; RD/post/TAA separated.
NEAR-TERM: fixed-step RD; checkpoint capture.
EXPERIMENTAL: temporal branching/rewind for stateful systems.
