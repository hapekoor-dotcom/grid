# 16 — Ranked Technical Debt

Ranked by systemic risk × cost to fix.

1. **Monolithic `PlayCanvasRuntime` (~4.4k lines)** — input, scene, material, shader, physics, RD, post, picking, camera and diagnostics. Hard to test/change. High.
2. **Runtime resource leaks / lifecycle** — `destroy()` omits `rd.destroy()` and `postEffect.destroy()`; mode switch recreates device. High.
3. **Signature-driven invalidation** — geometry/material/light signatures are incomplete and over-broad; shader/Look assignment can rebuild world; transforms fast-path. High.
4. **Two render stacks** — dead Three.js/R3F dependencies. Medium-high.
5. **Post pass index mismatch on failure** — stack vs built pass arrays. High when invalid shaders exist.
6. **No canonical clock/stateful resource policy** — RD/post/TAA/physics/timeline diverge. High for Tempus/reproducibility.
7. **Project deep-clone + whole workspace localStorage autosave** — performance/quota. Medium.
8. **Fragmented graph model** — modulators, field links, post values, mutation. Medium-high.
9. **Shared Look ownership ambiguity** — Look modifiers/shaders/field links cloned by ID patches, but runtime ownership remains implicit. High for complex Looks.
10. **Shader chunk duplication/ordering fragility** — include guards and conditional opacity chunks added; still a large generated GLSL surface. High.
11. **Picking/effective bounds heuristics** — screen projection with conservative expansion, not true GPU ID/deformed picking. Medium.
12. **Input ownership split across runtime/plan/timeline/modal** — recurring LMB class. High.
13. **No project-scoped resource registry** — stale RD/post/physics/caches can leak. High.
14. **Mutation records store full before/after JSON** — storage growth. Medium.
15. **Catalog of 90+ modifiers with uneven verification** — smoke compile, not visual grammar. Medium.
16. **Legacy/duplicated terminology** — RE:GRID, stage/rig editor identity vs RE:MORPH visual organism. High product debt.
17. **Accessibility/test coverage gaps** — no touch/stress/pointer-cancel full matrix. Medium.
18. **No runtime/editor package split** — bundle includes editors and dead code. Medium-high.

## Deletion candidates

- `StageScene.tsx`, `FixtureLight.tsx`, `VolumetricBeam.tsx`, `VolumetricScattering.tsx`, `SeatingMesh.tsx`, `FixtureModel.tsx` if unused.
- Three.js/R3F/postprocessing dependencies if dead.
- Duplicate `settingsOpen` line/bugs in UI store setMode.
- Dead `focus` path if only double-click used it.
- Overlapping plan/3D object semantics if runtime is the future.
