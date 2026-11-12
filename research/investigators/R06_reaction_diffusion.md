# R06 — Reaction Diffusion

FACT: one Gray–Scott ping-pong RGBA16F 9-point simulation, 32–1024, nearest, seed B noise, iterations 1–64.
FACT: shaders sample `.r` (chemical A); CPU `sampleOutput` reads `.g` (chemical B) — **semantic inconsistency**.
FACT: `.b/.a` unused; two species could fit but consumers need channel selection.
FACT: one shared texture; paint/collision injection; scalar 3×3 cached readback; spatial consumers GPU.
FACT: reset on resolution/seed/token; feed/kill do not reset; state not persisted.
FACT: `runtime.destroy()` does not call `rd.destroy()`; global sample provider.
FACT: allocation silently falls back to no texture/black if FBO incomplete; diagnostics may show invalid.
PROPOSAL: define canonical channel contract; verify EXT_color_buffer_float; checkpoint; destroy; channel/output selector; spatial maps before second simulation.
