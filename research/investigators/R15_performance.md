# R15 — Performance

FACT: project deep clone on every mutation; whole workspace JSON autosave; signature JSON; no graph cache; per-frame uniform loops.
FACT: RD up to 1024²×64; post 2×RGBA16F targets per pass plus history; 200 clone entities; TAA/bloom/fog.
FACT: legacy Three.js/R3F dependencies still installed.
FACT: no hardware benchmark.
PROPOSAL: explicit dirty flags, graph cache, instancing, adaptive RD budget, IndexedDB, bundle split, hardware matrix.
