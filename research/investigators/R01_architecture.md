# R01 — Current Architecture

See `../01_ARCHITECTURE_CURRENT.md` for full evidence.

FACT: React/Zustand editor + one monolithic PlayCanvas runtime; legacy Three.js/R3F stack remains but is not imported by AppShell.
FACT: `PlayCanvasRuntime` (~4.4k lines) owns init, scene, materials, lights, modifiers, shaders, input, picking, physics, camera, RD, post, diagnostics.
FACT: `workspaceStore` (~1.3k lines) owns projects/Undo/actions/persistence.
FACT: `PlayCanvasViewport` lazily mounts runtime; plan↔3D switch destroys/recreates app/device.
FACT: `setProject` uses JSON geometry signature; rebuild destroys world; fast path syncs.
RISK: runtime/project/UI/GPU state boundaries are implicit.
PROPOSAL: extract pure libs, resource registry, RuntimeSession, global input arbiter.
