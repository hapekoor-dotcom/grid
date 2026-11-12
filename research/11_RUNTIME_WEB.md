# 11 — Editor / Runtime Split and Web Deployment

## Current bundle reality (FACT)

`app/package.json` includes both PlayCanvas and a legacy Three.js/R3F stack:

- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `three`, `postprocessing`
- `cannon-es`, `fflate`

The active viewport uses PlayCanvas. `StageScene.tsx` and its Three.js components are not imported by the app shell. They are dead weight for the runtime path and a major cognitive/bundle cost.

## Editor vs Runtime

The editor currently contains:

- project management
- inspectors
- plan editor
- timeline
- Shader Lab
- graph editor
- mutation UI
- diagnostics
- persistence
- PlayCanvas runtime

A runtime would need only:

- project/config package
- assets/shaders
- runtime engine
- input bindings
- quality profile
- optional checkpoint
- capture/analytics hooks

## Web platform considerations

- WebGL2 is the current production path; RD requires raw WebGL2.
- WebGPU would help compute for RD/agents but is not required for MVP.
- Mobile/iGPU needs adaptive RD resolution, DPR, post count, clone counts, TAA.
- `preserveDrawingBuffer: true` is requested for screenshots; costs memory/performance.
- Tab throttling affects `dt`, physics and RD; fixed-step accumulator needed.
- OffscreenCanvas/worker could isolate simulation and asset work later.
- No service worker/caching strategy found for runtime deployment.

## Runtime packaging proposal

```text
seed/config
assets (compressed GLB/textures)
shader sources / compiled binaries
simulation checkpoints (optional)
interaction bindings
quality profile
runtime JS
```

The runtime must not import editors, React inspectors, plan editor, timeline editor or mutation UI. It may share pure libraries (clock, fields, signals, shader contracts).

## MVP classification

CORE: one deployable runtime mode for a captured scene.
NEAR-TERM: asset packaging, quality profiles, embed API.
EXPERIMENTAL: WebGPU simulation backend.
LATER: full multi-organism runtime ecosystem.
