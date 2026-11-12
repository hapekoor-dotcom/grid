# 12 — Performance Architecture

## CPU hotspots (FACT/INFERENCE)

- `mutate` deep-clones the entire active project for every edit; autosave then serializes whole workspace.
- `setProject` builds JSON signatures for geometry and material; `rebuild` reconstructs the whole world for structural changes.
- `applyShaderUniforms` and `applyModifiers` iterate objects and modifiers every frame; `executionOrderedModifiers` recompiles a plan each call.
- `modulatedParams` recursively re-evaluates sources each call; no per-frame graph cache.
- `collectMeshCapabilities` and selection marker updates are kept out of per-frame camera updates, but rebuild still scans meshes.
- React store updates on selection, hover and panel state can re-render large UI trees.
- `projectGeometrySignature` includes `shaders`/`lookId` (unintentionally), causing rebuilds for shader assignment.
- Clone entities are individual PlayCanvas entities, not GPU instancing; 200 clones means 200 draw calls (or shared material batches, but still entities).
- Picking uses `pc.Picker` prepare + getSelection; hover uses screen bounds, so hover is cheaper but approximate.

## GPU hotspots

- RD iterations per frame up to 64 at resolution up to 1024; each iteration is a fullscreen pass.
- Post stack allocates 2 targets per pass + history target; 5 passes = 10 targets at render scale.
- CameraFrame TAA/bloom/fog add cost; quality presets.
- Shader deformation is vertex work; no adaptive mesh.
- Material clones per mesh; no instancing.
- `preserveDrawingBuffer` and screenshots.
- Post intermediates RGBA16F memory.

## Memory

- whole-project deep clones and Undo stack (80 projects snapshots) can be large.
- Mutation records store before/after project JSON.
- RD textures: 1024² RGBA16F ×2 ≈ 16 MB plus FBO.
- Post targets per pass: RGBA16F ×2 (target+history) at scaled resolution.
- TAA history in CameraFrame.
- Legacy Three.js dependencies/bundle.
- Asset textures/models cached in runtime maps and not aggressively evicted on project switch.

## Recommendation

- Replace giant JSON signatures with explicit dirty flags; avoid full rebuild for shader/Look assignment.
- Cache compiled graph/order by topology revision.
- Move RD to fixed-step with adaptive resolution/iteration budget.
- Use GPU instancing for clones; or cap visible clones by budget.
- Make autosave incremental/IndexedDB; avoid deep clone on every transient interaction.
- Add performance budgets per quality tier and a runtime benchmark.

## MVP classification

CORE: no per-frame project cloning, explicit dirty flags, adaptive RD.
NEAR-TERM: graph cache, instancing, IndexedDB.
EXPERIMENTAL: WebGPU RD, worker simulation.
