# R14 — Persistence

See `../10_PERSISTENCE_REPRODUCIBILITY.md`.

FACT: whole workspace to localStorage; 700ms autosave; beforeunload/visibility save; project schema v5 migration.
FACT: runtime/GPU/physics/camera not saved; mutation accepted records store full before/after JSON.
FACT: no IndexedDB; quota failure toast only.
FACT: project switch does not explicitly reset RD/post/physics/camera.
PROPOSAL: IndexedDB, compact mutation ops/hashes, checkpoints, project-scoped resource teardown, storage budget.
