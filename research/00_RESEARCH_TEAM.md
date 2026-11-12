# RE:MORPH Research Organization

Status: active
Scope: read-only investigation of the current application; research documents only under `/research/`.
No application source, configuration, assets, tests or project data may be modified.

## Operating principles

- Current source is the primary evidence.
- Git history is treated as a lead, not proof.
- Every finding is labelled FACT, INFERENCE, EXTERNAL RESEARCH or PROPOSAL.
- Independent domains run in parallel.
- High-risk conclusions get independent verification.
- The final package must let a senior architect reason about RE without reading the repository first.

## Research lead

The lead owns the research plan, resolves contradictions, protects the read-only boundary, and writes the final synthesis.

## Investigator registry

| ID | Domain | Mission | Key questions | Primary evidence | Output | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Current architecture | Reconstruct module boundaries, dependency direction and lifecycle. | What owns startup? What is coupled to PlayCanvas? Which paths are editor-only? | `app/src/App.tsx`, `components/view3d/*`, `store/*` | `investigators/R01_architecture.md` | complete |
| R02 | State ownership | Map every source of truth and duplicate state. | Project vs runtime vs GPU vs UI vs cache. What survives switching? | `workspaceStore.ts`, `uiStore.ts`, `types/project.ts`, runtime fields | `investigators/R02_state_ownership.md` | complete |
| R03 | Render pipeline | Trace exact scene-to-pixel path. | CameraFrame order, formats, depth, TAA, bloom, post, composition. | `playcanvasRuntime.ts`, `RendererPostEffect.ts`, PlayCanvas | `investigators/R03_render_pipeline.md` | complete |
| R04 | Shader system | Audit Shader Lab, material replacement and fallback. | Compile lifecycle, uniforms, full custom vs extension, invalid GLSL. | `customShaders.ts`, `ShaderLabDialog.tsx`, `modifierShader.ts` | `investigators/R04_shader_system.md` | complete |
| R05 | Temporal systems | Inventory clocks, histories and reset paths. | Which systems are stateful? What survives pause/switch/resize? | runtime time fields, `RendererPostEffect.ts`, `ReactionDiffusionRuntime.ts` | `investigators/R05_temporal.md` | complete |
| R06 | Reaction Diffusion | Verify actual Gray-Scott implementation and routing. | One shared texture? Consumers? Reset? Readbacks? | `ReactionDiffusionRuntime.ts`, `reactionDiffusion.ts`, `modifierShader.ts` | `investigators/R06_reaction_diffusion.md` | complete |
| R07 | Generative systems | Compare candidate simulations for visual value and web cost. | RD, Lenia, Physarum, CA, NCA, growth, attractors. | external research + current RD | `investigators/R07_generative_systems.md` | complete |
| R08 | Signals / fields | Audit modulation and graph typing. | Scalar vs field, adapters, cycles, evaluation order, UX. | `signals.ts`, `graphRouting.ts`, `ModifierGraphDialog.tsx` | `investigators/R08_signals_fields.md` | complete |
| R09 | Mutation / evolution | Evaluate mutation as creative interaction. | Seeds, topology mutation, lineage, novelty. | `mutationEngine.ts`, UI, external IEC/QD | `investigators/R09_R10_mutation_time.md` | complete |
| R10 | Tempus / time | Design canonical artistic time concepts. | Render vs artistic vs sim vs physics vs timeline. | time fields, `timelineClock.ts`, Runtime | `investigators/R09_R10_mutation_time.md` | complete |
| R11 | Geometry / modifiers | Audit deformation, order, bounds, picking. | Ordered compiler, normals, clones, effective bounds. | `modifierShader.ts`, runtime modifier paths | `investigators/R11_geometry.md` | complete |
| R12 | Materials / Looks | Audit ownership, textures, UV fallback, PBR. | Look sharing, make unique, field-driven PBR, no-UV meshes. | `looks.ts`, material code, runtime | `investigators/R12_materials.md` | complete |
| R13 | Input / pointer | Reconstruct pointer ownership state machine. | LMB death, capture, modals, overlays, gizmos, marquee. | pointer handlers, `PlayCanvasViewport.tsx`, Dialogs, CSS | `investigators/R13_input_pointer.md` | complete |
| R14 | Persistence | Audit save, load, migration, cleanup and leakage. | Project switching, schema, runtime teardown, autosave. | `workspaceStore.ts`, `persistence`, `migration.ts` | `investigators/R14_persistence.md` | complete |
| R15 | Performance | Separate CPU/GPU/memory bottlenecks. | Graph eval, React, RD, post, clones, HDR memory. | runtime, renderer, external profiling knowledge | `investigators/R15_performance.md` | complete |
| R16 | Web runtime | Evaluate editor/runtime split and deployment. | Minimal runtime payload, WebGL2/WebGPU, adaptive quality. | current bundles, PlayCanvas, external | `investigators/R16_runtime_web.md` | complete |
| R17 | Live input | Evaluate audio/MIDI/OSC/DMX/sensors. | Which inputs strengthen self-organizing visuals? | external research, current signals | `investigators/R17_live_input.md` | complete |
| R18 | Competitive systems | Extract transferable lessons without cloning. | Time, feedback, simulations, debugging, scale failure. | external research | `investigators/R18_competitive.md` | complete |
| R19 | UX abstraction | Test TIME/ENTROPY/RELATION/FIELD/SIMULATION model. | What should users see? What stays hidden? | current UI, competitive systems | `investigators/R19_ux_abstraction.md` | complete |
| R20 | Product identity / MVP | Define the fundamental loop and MVP boundary. | What is RE? What must be deleted? | all evidence | `investigators/R20_product_mvp.md` | complete |
| R21 | Diagnostics | Design observability for recursive systems. | Provenance, ownership, NaN, shader, graph, pointer. | runtime diagnostics, external | `investigators/R21_diagnostics.md` | complete |
| R22 | Failure analysis | Classify systemic recurring failures. | Pointer, renderer magic, temporal poison, leakage, geometry, UV. | Git history, tests, current code | `investigators/R22_failures.md` | complete |

## Specialist splits

- R03A CameraFrame and composition.
- R03B HDR, color space and passthrough identity.
- R03C TAA and temporal post.
- R03D GPU render resources.
- R07A Reaction and morphogenesis systems.
- R07B Cellular and excitable systems.
- R07C Agent and swarm systems.
- R07D Dynamical/chaos systems.
- R13A DOM/event ownership.
- R13B Camera/gizmo/marquee.
- R13C Modal and overlay lifecycle.
- R15A CPU synchronization.
- R15B GPU passes and simulation cost.
- R15C memory and project switching.

## Cross-review assignments

| Reviewer | Reviews |
| --- | --- |
| R03 Render | R05 temporal, R06 RD, R15 performance |
| R05 Temporal | R03 render, R06 RD, R14 persistence |
| R02 State | R14 persistence, R13 input, R08 graph |
| R13 Input | R19 UX, R03 render overlays |
| R15 Performance | R07 simulations, R16 runtime, R06 RD |
| R19 UX | R08 signals, R09 mutation, R20 MVP |
| R20 MVP | all proposals |
| Red Team | all recommendations |
| Opportunity Team | all architecture + simulations |
| Product Identity | R20 and final synthesis |
| Final Critic | Executive synthesis |

## Evidence protocol

Every report should contain:

1. Scope and method.
2. Facts with file/function references.
3. Inferences explicitly marked.
4. External research with source names/links.
5. Proposals with benefit/cost/risk.
6. Open questions.
7. Confidence and unresolved uncertainty.

## Read-only boundary

No investigator may modify anything outside `/research/`.
If a proposed experiment needs code changes, it is described as a proposal only.
