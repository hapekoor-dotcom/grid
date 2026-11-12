# 14 — Competitive Systems: Synthesis

Full investigator report: `investigators/R18_competitive.md`.

## Condensed lessons

| System | Borrow | Do not copy |
| --- | --- | --- |
| TouchDesigner | Per-wire viewer; explicit Feedback TOP with named target, one-frame delay, bypass/reset. | Five operator-family coercion maze; global-name wiring; invisible cook dependencies. |
| Houdini | Typed attributes; explicit Solver previous-state input; spreadsheet; cache/rewind. | Context zoo and one-node-per-operation authoring; unreadable attribute domains. |
| Notch | Real-time GPU graph; strong live-performance defaults. | Opaque node graph as the only UX. |
| vvvv | Patching with live values and strong hardware integration. | Type/pin complexity for artists. |
| Max/MSP/Jitter | Explicit signal graph and reusable abstractions. | Graph sprawl; hidden load order. |
| Pure Data | Lightweight, explicit dataflow. | Discoverability and graph readability. |
| Resolume | Immediate clip/live visual workflow; simple controls. | Limited deep systemic composition. |
| Blender Geometry Nodes | Field sockets and named attributes; modifier stack. | Node trees as the primary mental model for every user. |
| Blender Simulation Nodes | Stateful simulation zones with explicit cache. | Heavy cache/DOP complexity. |
| Unreal Niagara | Modular emitters, GPU simulation, scalable quality. | Heavy engine-specific authoring. |
| Unreal Materials | Material graph with explicit execution pins. | Graph-only parameter exposure. |
| Unreal PCG | Procedural graph over spatial data. | Large graph for simple results. |
| Unity VFX Graph | GPU particles and blocks. | Context-specific black box. |
| Unity Shader Graph | Typed ports, previews, subgraphs. | Node explosion. |
| Substance Designer | Procedural texture graph with strong preview. | Slow iteration/cooking. |
| Cavalry | Procedural animation with clear scene graph. | Limited systemic simulation. |
| Processing/openFrameworks/Cinder | Code-first creative control. | No accessible live UI. |
| Hydra | Composable render delegates. | Complexity for non-render developers. |
| ShaderToy | Immediate shader feedback and remix culture. | No state/scene model. |
| cables.gl | Web-native node patching. | Graph sprawl and browser capability limits. |
| PlayCanvas | Web-first engine, CameraFrame effects, editor/runtime split. | Thin high-level authoring layer. |
| Three.js ecosystem | Enormous shader/example ecosystem. | Fragmented runtime and post stack. |
| Modular synths | Patchable modules, voltage-like signals, immediate feedback. | Cable spaghetti and no scene semantics. |

## Transferable product patterns

1. **Explicit feedback operator** with named target, frame delay and bypass is better than hidden previous-frame shaders.
2. **Viewer on every edge** is the strongest debugging idea in TouchDesigner.
3. **Attributes as named spatial data** (Houdini) is a better field abstraction than disconnected per-effect uniforms.
4. **State is data** — solver input/caches should be inspectable.
5. **Preview-driven shader tools** (ShaderToy/Substance) reduce iteration cost.
6. **Typed ports with visible adapters** are necessary once fields and values mix.
7. **Live-performance tools win on immediacy**, not feature count.
8. **Node graphs fail when they become the only explanation**; RE should keep a compact source vocabulary and reveal the graph on demand.

## What RE should explicitly avoid

- Cloning TouchDesigner's operator-family model.
- Cloning Houdini's context taxonomy.
- A permanent, always-visible graph as the primary UX.
- Hidden cook/rebuild dependencies that require “touch something” to repair.
- Feature-count competition with Notch/Unreal.
- A generic simulation framework before one simulation is excellent.

## Product implication

RE's differentiation is **steering an organism**, not building a graph. The graph is an internal/advanced representation of conditions. The normal loop should remain MUTATE/OBSERVE/KEEP.
