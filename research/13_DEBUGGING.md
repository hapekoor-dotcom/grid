# 13 — Debugging and Observability

## Current diagnostics (FACT)

- `InputDebugOverlay` with pointer, camera, post, RD, graph, geometry, hover/pick rows.
- `RendererPostEffect` reports passes, formats, depth, history states, reset reason, bypassed errors.
- `ReactionDiffusionRuntime` reports enabled/valid/resolution/steps/resets/reason/texture, injection/readback counts.
- Runtime reports graph nodes/edges/cycles/domains, geo ops, clone count, frame stats.
- Scene diagnostics dialog exists for rig/DMX/power.
- `window.__RE_RUNTIME__`, `window.__RE_STORE__`, `window.__RE_UI__`, `window.__RE_MODIFIERS__`, `window.__RE_CUSTOM__` debug globals.
- E2E pixel tests and catalog smoke.

## Gaps

- No unified “why is this parameter changing?” provenance.
- No resource ownership ledger (who created/destroyed a texture/FBO/material).
- No shader variant/source hash inspector per mesh.
- No NaN/Inf bounds/transform audit.
- No pointer owner across plan/timeline/modal/graph.
- No post pass instance mapping after failed pass.
- No GPU timer breakdown for RD vs post vs scene.
- Diagnostics are scattered between runtime fields and UI; no project-scoped session record.
- No log export bundle.

## Proposal

Developer mode should expose layers:

```text
World → object → material → shader → modifier/graph → parameter → source
Frame → passes → resources → history generation
Input → owner → gesture → capture
Simulation → source → texture → consumers
```

Each layer should have a stable ID and ownership record. Add a “capture diagnostics bundle” (JSON + screenshot + shader sources + resource inventory) for reproducibility.

## MVP

CORE: pointer owner, post pass mapping, resource ownership, NaN checks, graph provenance.
NEAR-TERM: GPU timing, shader variant inspector.
EXPERIMENTAL: time-travel execution trace.
