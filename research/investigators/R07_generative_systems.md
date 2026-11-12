# R07 — Generative and self-organizing systems for RE:MORPH

Status: research only; no application source, config or data touched.
Evidence: `app/src/components/view3d/ReactionDiffusionRuntime.ts`, `app/src/lib/reactionDiffusion.ts`, `app/src/components/view3d/modifierShader.ts`, `app/src/lib/reactionConsumers.ts`, plus external literature.
Labels: **FACT** read from source · **INFERENCE** reasoned from source plus known GPU behaviour · **EXTERNAL RESEARCH** literature · **PROPOSAL** recommendation.

## 0. The contract any new system must satisfy

**FACT** — RE has exactly one field. `ReactionDiffusionRuntime` owns a single square `RGBA16F` texture pair (ping-pong), 32–1024 px, `CLAMP_TO_EDGE`, `NEAREST`, one Gray–Scott step program, one inject program, `iterations` 1–64 per frame (default 8 at 256²).

**FACT** — consumers speak *scalar*, not *simulation*. `modifierShader.ts` samples only `.r` of `uReaction` and derives scalar / mask / gradient / normal / vector from a 3×3 shader neighbourhood. `reactionSurface` maps that to emission, opacity, base colour, roughness, metallic; `reactionDisplace` moves vertices; fullscreen custom post passes receive the same sampler as `uReaction`.

**FACT** — the CPU sees almost nothing: `sampleOutput` reads one 3×3 block at texture centre per frame, cached, returning scalar / mask / gradient / normal to the signal graph — from a *different channel* than the shaders see (3.6).

**FACT** — parameters are few and bounded: feed/kill 0–0.1, two diffusion rates, speed, iterations, resolution, contrast, threshold, invert, injection; ten hardcoded presets; `modulators` let signals drive those numbers; `FieldLink` adds eight adapters.

**INFERENCE** — so a system is cheap to add only if it (a) writes one square `RGBA16F` texture via ping-pong, (b) reduces to a spatially meaningful 0–1 scalar, (c) needs at most one tiny readback, (d) maps through the existing uv / object / world / spherical modes, (e) accepts a seed and a reset token. Anything needing its own pass graph, readback or object type is not "another RD" — it is a second product.

The question is not which simulation is most impressive, but which one produces a field the existing consumers can eat.

## 1. Cost basis

One default frame = 8 steps × 256² ≈ 524k fragment invocations and ~4 MB of half-float writes. Call that **1.0×**. Everything below is relative at equal resolution and step count; resolution scales quadratically and dominates.

**FACT** — PlayCanvas requests `EXT_color_buffer_float` at device init (`webgl-graphics-device.js:734`); RE never verifies it, and if both FBOs fail to complete it silently drops to a 1×1 black texture while still setting `uReactionEnabled = 1`. **PROPOSAL**: R06/R15 should treat that as a diagnostic gap, not a cosmetic one.

## 2. Systems

### 2.1 Gray–Scott, single species (incumbent)
**FACT** — 9-point Laplacian, weights 0.2 / 0.05, identical to Karl Sims' tutorial; presets trace Pearson's 1993 classification.
Character: material. Cells, coral, worms, maze — isotropic, scale-free, reads as surface chemistry rather than an object. Cost 1.0×; WebGL2 trivial; pure field state.
**Avoid**: presets 11–20. The two real knobs sit inside a narrow crescent; ten presets is already a workaround for an unreadable parameter space, and more of them deepen it.

### 2.2 Gray–Scott, two species ("duplex")
**EXTERNAL RESEARCH** — multi-species RD produces competitive exclusion, hard domain boundaries and travelling fronts that one species cannot; Pearson's "overcrowding collapse" is the one-species shadow of the same dynamics.
**FACT** — the state texture is `RGBA16F` and only `.r`/`.g` are used. `.b`/`.a` are dead.
**INFERENCE** — two full activator–inhibitor pairs fit *exactly* in the existing texture: same ping-pong, same program count, ~1.4× ALU, no extra bandwidth, no MRT, no new API beyond a channel selector.
Character: territory — two-tone materials with a history, immune-response patches, borders that anneal. Highest value per line of any change here. **PROPOSAL**: MVP.
Caveat: every consumer reads `.r`. Without a `uFieldChannel` (or extended output enum) the second species is invisible — a feature that quietly does nothing.

### 2.3 Turing / activator–inhibitor: Gierer–Meinhardt, FitzHugh–Nagumo, Barkley
**EXTERNAL RESEARCH** — GM gives tight spots and stripes; FN and Barkley give excitable media: spirals, re-entrant waves, dead zones.
Cost 1.0–1.3×, same integrator. GM's inhibitor is *shorter-range*, so feature size decouples from texel size — the one property RE's GS lacks.
Character: skin — finer grain, "material detail" rather than "growth". FN/Barkley read as pulse and spiral: best used as an *energy* channel (emissive travelling waves), not albedo.
**PROPOSAL**: alternate step programs behind the same texture contract — one `fieldKind` enum, one shader per kind, shared ping-pong, shared paint, shared consumers. Never parallel modules. GM is MVP (it fixes scale); excitable media is POST.

### 2.4 Spatial parameter maps, anisotropy, flow
**EXTERNAL RESEARCH** — Sims names exactly three cheap extensions: orientation, style map, flow.
**FACT** — RE modulates feed/kill only through *scalar* signals over time (`modulatedReactionDiffusion`), never through a spatial texture.
**INFERENCE** — a spatial f/k map is one extra fetch in the step shader; anisotropy two more; flow two more. ~1.15–1.3×.
This buys more range than any new simulation, because it lets RE *paint regimes* instead of sliding them, and gives painting a second meaning (paint a regime, not just chemical B). **PROPOSAL**: MVP, before adding any new system.

### 2.5 Cyclic and excitable cellular automata
**EXTERNAL RESEARCH** — cyclic CA (Griffeath): N states, a cell advances when a neighbour is next in the cycle, producing spirals and travelling bands; Greenberg–Hastings adds refraction.
Cost 0.5–0.7× per step, typically 1–2 steps/frame, so ~0.1× of the incumbent. Integer compare, no Laplacian, no precision drift.
Character: graphic. Hard bands and spirals, "printed" rather than "grown". Weakness: aliased at texel scale, degrades under filtering, and the look is almost entirely palette — it reads as a shader effect, not a material.
**PROPOSAL**: POST, and only for *signal* propagation (a pulse crossing objects), where hard edges are the point.

### 2.6 Lenia
**EXTERNAL RESEARCH** — Chan 2019: continuous CA with a ring kernel and growth function; 400+ species, most found by interactive evolution.
Cost: K-tap ring convolution per channel per step. At 256², 3 channels, ~30 taps, 10–15 steps/frame → roughly 4–8×. Viable at 256², not at 512².
Character: organisms — soft, metameric, self-propelling blobs. Beautiful and wrong for RE: a creature sim, not a material. It does not tile, does not sit on a truss face, has no natural mapping to architecture. Its 4–8 parameters sit on a fractal map; Chan needed evolution to explore it.
**PROPOSAL**: HOLD — a reference for kernel-based CA and evolved-parameter browsing, not an MVP feature.

### 2.7 Neural cellular automata
**EXTERNAL RESEARCH** — Mordvintsev et al. 2020: 16-channel state, Sobel perception, ~8k-parameter update rule trained to grow and regenerate a target.
**INFERENCE** — 16 channels need four `RGBA16F` targets (or MRT) and ~8k MACs per cell: fine at 128², not at 512².
Character: petri dish — soft, stable, regenerative. "Erase it and watch it regrow" is genuinely magical. But the parameter space *is* 8000 weights: no authoring path, no meaningful slider, and mutation yields death or noise. It also means shipping trained checkpoints — an asset and licensing decision, not a shader one.
**PROPOSAL**: HOLD. If RE ever wants seed-grown patterns, the honest form is a curated gallery of baked checkpoints.

### 2.8 Physarum / slime mould
**EXTERNAL RESEARCH** — Jones 2010: agent transport networks reproduce real *P. polycephalum* foraging; the standard GPU form uses three sensors per agent, deposit, diffuse-and-decay.
Cost: agent state in textures (position + heading in RGBA), one sensing/moving pass, one deposit-diffusion pass. 256² = 65k agents is cheap; 1024² = 1M agents is a few ms. ~1.5–2× plus a splat pass.
Character: veins. Networks, adaptive transport, anisotropy that follows flow. The best "morphology" look here and the closest to something a rig tool would want to *draw with*.
Field output: excellent — the deposit trail is already a scalar field with strong gradients, arguably better than GS for displacement.
Statefulness: worst class. Order-dependent, resolution-coupled, resets only by replay, discontinuous if agent count changes. RE's seed + `resetToken` contract does not describe it.
**PROPOSAL**: POST, high payoff — but price it as a second subsystem with its own state model. Do not smuggle it in as "another RD".

### 2.9 Differential growth and space colonization
**EXTERNAL RESEARCH** — differential growth (edge subdivision plus repulsion) yields frills, folds, coral and brain-like silhouettes; space colonization grows branching skeletons toward attractors.
Cost: CPU, not GPU. 2k–10k nodes with a spatial hash is 2–5 ms/frame, or bake once to a mesh.
Character: silhouette and structure, not texture — the only family here that changes *shape*. It matters to RE specifically because RE's identity is deformation of architectural objects (twist, bend, taper, attractor, vortex): growth generates geometry those modifiers can then act on, an *input* to the existing system rather than a replacement for the field.
Weakness: output is a mesh or polyline; it does not drive `uReaction` without being rasterized, and rasterizing wastes the point.
**PROPOSAL**: POST, strategic. Prototype before any agent simulation — it produces assets, not pixels.

### 2.10 Coupled map lattices and oscillator lattices
**EXTERNAL RESEARCH** — Kaneko CML: logistic maps on a lattice with diffusive coupling, giving travelling waves, defect turbulence, clustering. Kuramoto: phase oscillators and a global order parameter.
Cost: CML ≈ CA (0.3–0.6×); Kuramoto with 64–256 oscillators is negligible on CPU.
Character: interference and domains — low distinctiveness, hard to tell from the incumbent at a glance.
Where it is genuinely useful: as a *signal source*. A Kuramoto bank gives a smooth, non-repeating, coupled 0–1 signal, far more interesting than an LFO for driving feed, kill or anything else.
**PROPOSAL**: DROP as a field; MVP-adjacent as a signal generator. Route to R08 / R17, not the render path.

### 2.11 Agent / particle-life / swarm
**EXTERNAL RESEARCH** — Ventrella's Clusters (2010) and "particle life": an asymmetric N×N attraction matrix produces cell-like clustering and locomotion.
Cost: naive O(n²) is fatal in JS; on GPU it needs spatial hashing or a fixed stencil, changing the behaviour. At 4k–16k particles roughly 1–3×, with poor batching and no link to the field.
Character: dots in space — social, alive, aesthetically a different product. It fills a volume with entities, not a surface with material. Field output: none without splatting density, which loses what made it interesting.
**PROPOSAL**: DROP for the field pipeline; POST at most as a separate particle object type.

### 2.12 Three-dimensional RD
**INFERENCE** — a 64³ volume is 262k cells per step and needs a 3D texture with 6-neighbour sampling; 32–64 steps to develop, so it must run off the frame budget. `64³ × 8 B = 2 MB` per state — memory and fill rate are fine, *time* is not.
Character: volume — clouds, sponge, marrow. RE has volumetric scattering, so the temptation is real.
**Avoid**: the entire consumer chain is a 2D UV field on a surface. A volume forces every modifier, mapping mode and post pass to grow a second path, and a 2D slice of 3D RD looks worse than the 2D RD.
Cheaper alternative: **area-weighted RD in the mesh UV atlas** (Turk 1991), removing stretching and seams for one per-vertex texel-density attribute. **PROPOSAL**: do this instead of 3D.

## 3. Cross-cutting findings

**3.1 Statefulness, not physics, is the real classifier.** Field state (GS, GM, FN, CA, Lenia) is resumable, seedable, one texture, fits RE today. Agent state (Physarum, particle life, NCA with life mask) resumes only by replay, is resolution-coupled, and needs its own seeding and reset semantics. Baked geometry (growth, space colonization) is not a runtime simulation at all. RE's seed / `resetToken` / resolution contract describes only the first class; class-2 additions need a new lifecycle and should be priced as one.

**3.2 Readback, not simulation, is the cost that bites.** The sim is GPU-side; the 3×3 `readPixels` is a pipeline stall. It is small today because it is 3×3 and cached per frame. A system wanting ten field samples per frame for signals will be slower than one running twice the steps.

**3.3 Parameter count must match the interaction budget.** RE's authoring surface is roughly ten sliders, ten presets and modulators. Systems with ≤6 semantically ordered parameters (GM, FN, Physarum, cyclic CA) can be authored; systems with 30+ (particle life) or 8000 (NCA) can only be *selected* or *evolved* — which makes R09's mutation engine the gate on high-dimensional systems, and only if mutation runs on a meaningful basis.

**3.4 Scale is unaddressed. FACT** — feature size follows texel and step size, not world units; there is no "this cell is 3 cm" parameter. The same preset reads at wildly different scales on a 12 m truss and a 20 cm bar, and every new system inherits this. **PROPOSAL**: make pattern scale (metres per feature) a first-class field parameter.

**3.5 Determinism. FACT** — seeding is a hash of x, y, seed with 1.5% of texels at B=0.9: deterministic and cheap, a good bar. Agent systems seeded the same way will still differ per GPU because lattice-update order changes. **PROPOSAL**: keep class-2 systems out of the saveable path.

**3.6 The field already means two different things. FACT** — shaders read channel `.r` (chemical A) while the CPU `sampleOutput` reads channel `.g` (chemical B), so object shading and signal modulation are driven by different chemicals with different thresholds. That is a semantic bug in the contract, not a simulation question, but it becomes visible the moment a second species or a channel selector exists. **PROPOSAL**: fix the channel contract before extending it.

## 4. Recommendation table

| System | Cost | WebGL2 | State | Params | Control | Mutation | Class |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gray–Scott 1-species | 1.0× | trivial | field | 2+2 | med | high | **CORE** |
| Gray–Scott 2-species | 1.4× | trivial | field | 4–8 | med | med | **MVP** |
| Param maps / anisotropy | 1.2× | trivial | field | +4–6 | high | high | **MVP** |
| Gierer–Meinhardt | 1.2× | trivial | field | 4–6 | high | high | **MVP** |
| FitzHugh–Nagumo | 1.3× | easy | field | 3–4 | high | med | POST |
| Cyclic / excitable CA | 0.1–0.2× | easy | field | 2–4 | high | high | POST |
| Physarum | 1.5–2× | hard | agent | 6–9 | med | med | POST |
| Differential growth | 2–5 ms CPU | n/a | baked | 4–6 | high | med | POST |
| Space colonization | CPU once | n/a | baked | 5–6 | high | med | POST |
| Lenia | 4–8× | medium | field | 4–8 | low | high/IEC | HOLD |
| Neural CA | 8–20× | hard | agent-ish | ~8000 | very low | low | HOLD |
| 3D RD | 6–10× | medium | field | 4 | med | med | HOLD |
| CML / Kuramoto | 0.3× / ~0 | easy | field | 3–4 | high | med | DROP field; **MVP signal** |
| Particle life | 1–3× | medium | agent | N² | low | high | DROP |

## 5. What to avoid

- **A simulation module per idea.** Add a `fieldKind` behind one texture, one paint path, one consumer chain; otherwise every modifier, post pass and diagnostic doubles.
- **Parameters that cannot be felt.** If a slider's neighbourhood is visually identical, it is a random seed with extra steps.
- **Agent systems in the saveable path.** They cannot round-trip through seed + resetToken and diverge silently after reload.
- **Volume before surface.** 3D RD is a bigger change than it looks and a worse image than the 2D field on the geometry RE has.
- **Equal-looking alternatives.** Cyclic CA and CML add little that GS + parameter maps do not already give on a surface. Uniqueness, not novelty, should justify the next system.
- **Replacing the incumbent.** Gray–Scott is not the bottleneck; missing scale control, unused channels and absent spatial maps are.

## 6. Sources

- Pearson, *Complex Patterns in a Simple System* (1993) — https://arxiv.org/abs/patt-sol/9304003
- Karl Sims, *Reaction-Diffusion Tutorial* — https://www.karlsims.com/rd.html
- Chan, *Lenia — Biology of Artificial Life* (2019) — https://arxiv.org/abs/1812.05433
- Chan, *Lenia and Expanded Universe* (2020) — https://arxiv.org/abs/2005.03742
- Mordvintsev et al., *Growing Neural Cellular Automata* (2020) — https://distill.pub/2020/growing-ca/
- Jones, *Rules for Biologically Inspired Adaptive Network Design* (2010) — https://www.science.org/doi/10.1126/science.1177894
- Ventrella, *Clusters* — https://www.ventrella.com/Clusters/intro.html
- Turk, *Generating Textures on Arbitrary Surfaces Using Reaction-Diffusion* (1991) — https://doi.org/10.1145/122718.122736
- MDN, `EXT_color_buffer_float` — https://developer.mozilla.org/en-US/docs/Web/API/EXT_color_buffer_float
- Webb, *morphogenesis-resources* — https://github.com/jasonwebb/morphogenesis-resources

## 7. Handoffs

R06: confirm the float-FBO fallback and the `.r`-only consumer assumption. R08: the field contract is the right abstraction boundary; `fieldKind` / `uFieldChannel` belongs there. R09: mutation only pays off on low-dimensional, semantically ordered parameter spaces. R15: cost ordering above, resolution dominates. R20: MVP is two-species RD + spatial parameter maps + pattern scale, not a new simulation.
