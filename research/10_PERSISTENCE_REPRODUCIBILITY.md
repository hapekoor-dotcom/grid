# 10 — Persistence and Reproducibility

## Current persistence (FACT)

- Whole workspace saved to `localStorage` under a workspace key via `saveWorkspace`.
- Debounced autosave 700 ms after any Zustand `projects`/`activeId` change in `App`.
- Save on `beforeunload` and `visibilitychange hidden`.
- Project JSON imported/exported separately; `fflate` used for portable bundles.
- Project schema version 5; migration code handles legacy nodes/areas.
- Runtime state is not saved: camera, RD textures, post history, TAA, physics, clones, diagnostics, hover/selection.
- `Project.mutation` stores mutation records with full before/after JSON config snapshots.
- Undo/Redo is in-memory project snapshots (`past`/`future`, max ~80).

## Risks

1. `localStorage` synchronous whole-workspace JSON write can block the main thread and fail at quota.
2. Large mutation snapshots, shader sources and assets can exhaust quota; storage errors surface as a toast but do not degrade gracefully.
3. No atomic write/versioned backup; a quota failure may leave previous workspace intact but user changes unsaved.
4. Project switching does not reset all runtime state (RD, post history, physics, camera) explicitly.
5. Runtime `destroy()` does not destroy RD or `postEffect` explicitly; resource leakage on mode switch.
6. `setReactionSampleProvider` is global; multiple runtimes can race.
7. No saved checkpoints for stateful systems; reload cannot reproduce current visual state.
8. `normalizeCustomShaders` and migration are permissive but can silently drop new fields if not added.

## Three reproducibility goals

A. Same configuration: project JSON + shader sources + assets + seed. Mostly possible.
B. Same current visual state: requires GPU texture snapshots for RD/post/TAA, physics/spring state, camera, time/phase. Not possible today.
C. Same future evolution: requires B + deterministic clocks/PRNG + fixed step + seed + input schedule. Not possible today.

## Recommendation

- Move persistence to IndexedDB for projects/assets and keep localStorage for small UI prefs.
- Store schema version and explicit migration for every project field.
- Add `RuntimeSession`/`Capture` objects with explicit GPU checkpoint support.
- Add project identity to runtime resources; reset on switch.
- Add storage budget diagnostics and export-to-file fallback.
- Add autosave test with large RD/post/mutation data.

## MVP classification

CORE: project config save/load, schema migration, project-scoped runtime cleanup.
NEAR-TERM: IndexedDB, checkpoints for RD/post.
EXPERIMENTAL: full future-evolution replay.
