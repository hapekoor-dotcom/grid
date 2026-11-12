# 06 — Simulation Research

Full specialist report: `investigators/R07_generative_systems.md`. Verification status: current RD is FACT; external comparisons are EXTERNAL RESEARCH/INFERENCE.

## Current simulation (FACT)

- One Gray-Scott simulation only.
- Raw WebGL2, ping-pong RGBA16F textures, nearest filtering, resolution 32–1024.
- Explicit seed initialization: chemical A=1, B sparse noise threshold.
- Step computes 9-point Laplacian and Gray-Scott reaction.
- `feed`, `kill`, `diffusionA`, `diffusionB`, `timeStep`, `speed`, `iterations`.
- Paint and physics collision inject A/B.
- Outputs: scalar texture via `.r`, mask, gradient/normal derived in shader, vector displacement.
- One shared texture is sampled by all consumers.
- RD state is not saved; only config and resetToken.
- **FACT / critical:** shader consumers sample `.r` (chemical A); `sampleOutput` reads `.g` (chemical B) for the signal graph. The same RD currently means two different chemicals depending on consumer.

## Highest-leverage findings from R07

- Two-species Gray–Scott fits in the existing RGBA16F `.r/.g/.b/.a` resources with ~1.4× ALU and no extra passes, but consumers need a channel/output selector.
- Spatial parameter maps / anisotropy / flow are cheaper and often more expressive than a new simulation family.
- Gierer–Meinhardt is a candidate for explicit feature-size control.
- Do not add Lenia/NCA/3D RD/agent systems to the saveable MVP path before the field contract and performance baseline exist.
- PlayCanvas requests `EXT_color_buffer_float`; RE does not verify FBO completeness support explicitly before silently falling back.

## Candidate systems and RE relevance

### Multi-species / coupled RD
- Character: richer spots/stripes, interacting morphologies.
- Cost: 2–4 textures; extra channels; shader complexity.
- WebGL2: feasible at reduced resolution.
- RE fit: high; same field-output/consumer model.
- Risk: parameter space explodes; presets become essential.

### Anisotropic / directional RD
- Character: fibers, directional growth, flow-like patterns.
- Cost: low; tensor or directional diffusion in shader.
- RE fit: high; could be a modifier on existing RD rather than a new simulation.

### Activator–inhibitor / Turing
- Character: spots/stripes/labyrinth; similar to RD.
- Cost: similar.
- RE fit: high, but may be redundant with Gray-Scott unless distinct dynamics.

### Differential growth
- Character: organic folds, coral, leaves, tissue.
- Cost: geometry-heavy; CPU/GPU mesh or particle growth.
- WebGL2: possible with GPU particles/instancing; topological quality hard.
- RE fit: very high for “organism” identity; technical risk high.

### Physarum / slime mold
- Character: adaptive networks, veins, transport.
- Cost: agents + deposit/decay field; GPU particles or texture-space agents.
- RE fit: high; field output + geometry/material consumers.
- MVP: experimental, not core.

### Lenia / continuous cellular automata
- Character: life-like blobs, locomotion, complex regimes.
- Cost: multi-channel convolution; GPU-friendly at low resolution.
- RE fit: high for autonomous organisms; parameter discovery harder.

### Cellular automata / cyclic / excitable
- Character: discrete patterns, waves, synchronization.
- Cost: low.
- RE fit: medium; useful as a field generator, not necessarily a standalone product.

### Neural cellular automata
- Character: learned growth/repair.
- Cost: inference network per step; weight loading; training outside RE.
- RE fit: experimental; reproducibility/model assets complex.

### Agent / particle-life / boids
- Character: swarms, trails, emergent motion.
- Cost: particles + neighbor search; GPU compute harder in WebGL2.
- RE fit: high for installations; can output points/fields.

### Coupled oscillators / Kuramoto
- Character: synchronization waves; abstract.
- Cost: low for hundreds/thousands on CPU or GPU.
- RE fit: good for light/audio/field modulation, weaker as geometry.

### Chaotic maps/attractors
- Character: ribbons, strange forms.
- Cost: low; deterministic.
- RE fit: high for procedural geometry/point fields; less for continuous surfaces.

## Recommendation

Do not add another simulation until the existing RD field contract is formalized:

```text
FieldSource → { scalar, mask, gradient, normal, vector, texture, metadata }
```

Then add **one** contrasting simulation from a different family (Physarum or Lenia) as an experimental field source. Preserve the single-source-per-simulation rule. Keep simulation state explicit and checkpointable.

## MVP classification

CORE: RD.
NEAR-TERM: RD presets/anisotropy, one additional field source.
EXPERIMENTAL: Physarum, Lenia, NCA, differential growth.
LATER: multi-species ecosystems.
REJECT for MVP: general simulation framework with arbitrary graph cycles.
