# R18 — Competitive Systems: Transferable Lessons for RE:MORPH

**Scope:** read-only. **Method:** vendor documentation plus design analysis against RE's modules. **Labels:** `FACT` = observed at `6964523`; `EXTERNAL RESEARCH` = documented elsewhere; `INFERENCE` = analysis; `PROPOSAL` = recommendation. System notes combine EXTERNAL RESEARCH with INFERENCE; "Do not copy" lines are PROPOSAL.

## 1. What RE already is

`FACT` — RE contains four computational idioms:

- scalar signals `f(time, object)` — sine, noise, FBM, sample-and-hold, distance — in project data (`app/src/lib/signals.ts`);
- a shared Gray–Scott field with `seed`, `resetToken`, iterations, resolution, injection (`app/src/lib/reactionDiffusion.ts`);
- ordered modifier stacks per object/scene, including Feedback/Afterimage (`app/src/lib/modifiers.ts`);
- seeded mutation with diff and cycle guard (`app/src/lib/mutationEngine.ts`).

`INFERENCE` — RE is already a hybrid of modular synth, field simulation and procedural stack. The question is not which tool to imitate but which contracts make a hybrid legible: TIME, ENTROPY, RELATION, FIELD, SIMULATION.

## 2. Lens

For each system: atom/type, composition, time, feedback/state, reuse, debugging, live editing, and scale failure — compressed into **Borrow / Model / Breaks / Do not copy**. In **Model**, `signal` = scalar/event, `field` = spatial/per-element, `time` = transport/simulation/render.

## 3. System notes

### TouchDesigner

**Borrow:** every wire has a viewer, and feedback is an explicit operator. The [Feedback TOP](https://docs.derivative.ca/Feedback_TOP) reads from a named downstream Target, so the cycle is authored, delayed by one frame, resettable and bypassable. This is the single best model for RE's Feedback modifier.

**Model:** signal = CHOP channels; field = TOP images; time = global timeline plus per-operator "cook"; feedback = target link plus history buffer; state is hidden in that buffer; reuse = components and clones; debug = per-OP viewer, cook time, info channels; live = parameter edits are immediate.

**Breaks:** five operator families (TOP/CHOP/SOP/DAT/POP) create coercion mazes; "export" references and global paths make dependencies invisible; a 200-node network has no legible summary; topology edits can silently restart cooks.

**Do not copy:** the family split, global-name wiring, or cook dependencies users cannot see.

### Houdini

**Borrow:** attributes are named, typed fields on points, primitives and vertices, and the [Solver SOP](https://www.sidefx.com/docs/houdini/nodes/sop/solver.html) feeds the previous frame's output into the current frame explicitly. State is data; caches can be rewound and inspected in the [geometry spreadsheet](https://www.sidefx.com/docs/houdini/model/attributes.html).

**Model:** signal = channel or attribute; field = per-element attribute; time = frame/subframe with explicit simulation state; feedback = solver input; state = cached geometry; reuse = HDAs; debug = spreadsheet and middle-click info; live = parameter changes re-cook, often from cache.

**Breaks:** the context taxonomy (SOP/POP/DOP/VOP/LOP/CHOP) and attribute-domain rules are expert-only; heavy simulations produce enormous caches; "why is this value wrong" needs the spreadsheet plus a mental node stack.

**Do not copy:** the context zoo or one-node-per-operation authoring.

### Notch

**Borrow:** one graph renders immediately, and exposed parameters are a first-class contract for media servers and control surfaces. Cloners generate structure while effectors and fields modify instances — a clean separation RE should mirror.

**Model:** signal/field = node values, fields and images; time = timeline plus real time; feedback = accumulators and stateful modifiers; state = node-owned; reuse = assets, embedded nodes and blocks; debug = profiler and log, but limited per-node introspection; live = strong, built for performance.

**Breaks:** parent-child hierarchy and dependency wires share one canvas, so two different semantics look alike; effector order is hard to read; packaged blocks hide internals.

**Do not copy:** opaque blocks without an "open the box" path, or hierarchy and dataflow drawn identically.

### vvvv

**Borrow:** spreads are implicit vectorization — one node maps over N values without a loop — and the reactive layer keeps event streams separate from the frame mainloop. The explicit bridges `HoldLatest`, `Sampler` and `S+H` are exactly the semantics RE needs between events and fields ([vvvv reactive documentation](https://thegraybook.vvvv.org/reference/libraries/reactive.html), [patches](https://thegraybook.vvvv.org/reference/language/patches.html)).

**Model:** signal = event observable or per-frame value; field = spread; time = mainloop plus event time; feedback = `S+H` or frame delay; state = explicit hold nodes; reuse = regions and nodes; debug = inspectors, though cardinality is opaque; live = hot-reload .NET.

**Breaks:** "is this a spread or an event?" is the classic beginner bug; empty, one, and many slices produce silent no-ops; C# interop and type errors are unforgiving.

**Do not copy:** implicit broadcasting without a cardinality display, or two paradigms leaking into one port.

### Max/MSP/Jitter

**Borrow:** a hard split between messages (events, scheduler) and signals (DSP vectors) is teachable and prevents a whole class of category errors. `poly~` gives per-voice reuse, and `tapin~`/`tapout~` make feedback a deliberate delay line ([Max sample-accurate scheduling](https://docs.cycling74.com/legacy/max8/vignettes/audio_sampleaccurate)).

**Model:** signal = audio vector; field = Jitter matrix; time = scheduler milliseconds plus DSP vector; feedback = delay line; state = objects and voices; reuse = abstractions and `poly~`; debug = print, scope, probe; live = hot patching with audio risk.

**Breaks:** right-to-left execution order is invisible; scheduler and audio-thread interactions cause order bugs; `send`/`receive` global names create action at a distance; large patchers are unreadable.

**Do not copy:** hidden execution order or global message names.

### Pure Data

**Borrow:** tiny orthogonal primitives, `[clone]`, and abstractions that compose without a framework. GEM shows immediate-mode graphics living beside a dataflow audio language.

**Model:** signal = block; field = GEM chain state; time = block plus `metro`; feedback = `delwrite~`/`delread~`; state = objects; reuse = clone and abstraction; debug = `[print]`; live = patch while running.

**Breaks:** no types, almost no error surfacing, scattered GUI state, externals drift, no structural debugging. "Anything can connect to anything" becomes a liability.

**Do not copy:** untyped ports or print-only debugging.

### Resolume

**Borrow:** the clip/layer/column performance model is the best live-triggering UX in the survey: quantized launches, per-clip/layer/master effects, and MIDI/OSC mapping ([Resolume effects](https://resolume.com/support/en/effects)).

**Model:** signal = clip or parameter; field = layer composite; time = BPM and transport; feedback = limited; state = deck state; reuse = presets and clips; debug = layer preview; live = excellent.

**Breaks:** the ontology is layers and clips, not fields or simulations; effect order across clip, layer and master is a frequent confusion; complex generative work needs external tools.

**Do not copy:** layers as the only model, or fixed compositing chains.

### Blender Geometry / Simulation Nodes

**Borrow:** fields and single values are distinct socket semantics; a [Simulation Zone](https://docs.blender.org/manual/en/latest/physics/simulation_nodes.html) threads state in and out explicitly; attributes ride on geometry and are visible in a spreadsheet. This is the cleanest stateful-node design in the survey ([fields](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/fields.html)).

**Model:** signal = single value; field = per-element field; time = frame plus simulation zone; feedback = zone state; state = explicit geometry and attributes; reuse = node groups and assets; debug = viewer and spreadsheet; live = parameter edits re-evaluate.

**Breaks:** attribute domains (point/edge/face/corner) and implicit conversion are the main trap; "capture attribute" patches over ambiguity; simulation caches are heavy; dense geometry is slow.

**Do not copy:** domain rules leaking to users.

### Unreal Niagara / PCG / Materials

**Borrow:** Niagara separates spawn, update and render stages, namespaces parameters, adds simulation stages for iterative GPU work, and compiles material graphs to shader permutations ([Niagara overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-niagara-effects-for-unreal-engine), [simulation stages](https://dev.epicgames.com/documentation/en-us/unreal-engine/niagara-simulation-stages-in-unreal-engine)). PCG separates point generation from asset placement ([PCG overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/procedural-content-generation-overview)).

**Model:** signal = parameter or attribute; field = particle attribute or grid; time = tick/age with fixed delta; feedback = persistent particle state; state = per-particle; reuse = modules, emitters, subgraphs; debug = debug draw and attribute inspector; live = good in-editor, but compile-heavy.

**Breaks:** namespaced binding is powerful but opaque; CPU and GPU paths diverge; the stage stack is fixed; compile times; data channels are asynchronous.

**Do not copy:** engine coupling or parameter namespacing.

### Unity VFX Graph / Shader Graph

**Borrow:** VFX Graph's context/block pipeline compiles to GPU compute; the blackboard is a clean exposed-parameter surface; Shader Graph gives typed ports and per-node previews ([VFX Graph](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/index.html), [Shader Graph](https://docs.unity3d.com/Packages/com.unity.shadergraph@17.0/manual/index.html)).

**Model:** signal/field = attributes; time = fixed delta plus play rate; feedback = GPU buffer state; state = per-particle; reuse = subgraphs; debug = attribute gizmos; live = parameter changes, compile-gated.

**Breaks:** the context pipeline is fixed, so self-organizing topology is hard; GPU-only constraints; capacity and bounds bugs; opaque compile errors; shader-stage and coordinate-space confusion.

**Do not copy:** fixed pipelines as the only option.

### Substance Designer

**Borrow:** everything is a deterministic function of UV and parameters; graph instances and exposed parameters generate a family of textures from one graph ([Substance Designer](https://helpx.adobe.com/substance-3d-designer.html)).

**Model:** signal = constant; field = image/UV function; time = none; feedback = none; state = none; reuse = graph instances; debug = 2D/3D view; live = parameter edits re-bake.

**Breaks:** no time or state, so it cannot self-organize; graph scale; resolution and bit depth; bake/cache.

**Do not copy:** the purely functional ontology.

### Cavalry

**Borrow:** procedural 2D animation with duplicators, generators, a spreadsheet, expressions, and dynamic data binding ([Cavalry docs](https://cavalry.scenegroup.co/docs)). Duplicators are structure × field, the right mental model for instanced agents.

**Model:** signal = attribute; field = duplicator distribution; time = timeline; feedback = limited; state = scene and attributes; reuse = assets; debug = spreadsheet; live = strong.

**Breaks:** 2D scope; timeline-versus-procedural duality; attribute scoping; limited simulation depth.

**Do not copy:** timeline-only authoring.

### Processing

**Borrow:** a sketch is a program with a draw loop; zero ceremony; the best on-ramp in the survey ([Processing reference](https://processing.org/reference)).

**Model:** signal = variable; field = pixels; time = `frameCount` and delta; feedback = previous frame buffer; state = globals; reuse = classes and libraries; debug = print; live = restart to run.

**Breaks:** global mutable state and no graph; no built-in hot reload; reuse is code-only; debugging is print.

**Do not copy:** code-only authoring or restart-to-edit.

### openFrameworks / Cinder

**Borrow:** native C++ control, addons, and performance when the browser is not enough ([openFrameworks](https://openframeworks.cc/documentation/), [Cinder](https://libcinder.org/docs/)).

**Model:** signal = variable; field = texture or mesh; time = app loop; feedback = FBO; state = C++ objects; reuse = addons; debug = native tools; live = recompile.

**Breaks:** build systems, boilerplate, memory ownership, no introspection.

**Do not copy:** a native toolchain requirement. Treat it only as a future performance escape hatch.

### Hydra (USD)

**Borrow:** a scene description is separate from the render delegate; evaluation is lazy and pull-based; composition, references and overrides allow non-destructive variation ([Hydra guide](https://openusd.org/dev/api/_page__hydra__getting__started__guide.html)).

**Model:** signal = attribute or time sample; field = prim attribute; time = time samples; feedback = scene state; state = USD stage; reuse = references, payloads, instancing; debug = usdview; live = layer edits.

**Breaks:** composition arcs, schemas, variant sets and dictionaries are a steep tax; over-engineering for a small project.

**Do not copy:** the full composition model.

### ShaderToy

**Borrow:** one fragment shader with `iTime`, `iResolution` and `iMouse`; multipass Buffer A–D with ping-pong feedback; a whole world shared by URL ([ShaderToy how-to](https://www.shadertoy.com/howto)).

**Model:** signal = uniform; field = pixel; time = `iTime` and frame; feedback = previous buffer; state = buffer; reuse = copy-paste; debug = color; live = edit and recompile.

**Breaks:** global uniform soup; no modules; multipass dependencies are implicit; debugging by color; performance traps.

**Do not copy:** global uniforms or copy-paste reuse.

### cables.gl

**Borrow:** browser-native ops graph with sub-patches, parameters, live preview, export and collaboration ([cables.gl docs](https://cables.gl/docs)).

**Model:** signal = port value; field = texture; time = frame; feedback = buffer/state ops; state = op-owned; reuse = sub-patches and ops; debug = previews; live = strong.

**Breaks:** op lifecycle and texture/value types; per-frame evaluation cost; opaque ops; framework lock-in.

**Do not copy:** lock-in or opaque ops.

### PlayCanvas

**Borrow:** a lightweight entity/component runtime with a clean editor/runtime split and a real asset registry ([PlayCanvas manual](https://developer.playcanvas.com/user-manual/)).

**Model:** signal = script value; field = texture; time = app update; feedback = render target; state = entities and components; reuse = templates and instancing; debug = devtools and stats; live = editor.

**Breaks:** no procedural graph; resource ownership and lifecycle; the scene graph tends to become the de facto source of truth, duplicating project state.

**Do not copy:** scene graph as the only source of truth.

### Three.js ecosystem

**Borrow:** a transparent scene graph, material/shader chunks, and now TSL node materials for WebGPU; the largest web 3D ecosystem ([Three.js docs](https://threejs.org/docs/), [node materials](https://github.com/mrdoob/three.js/wiki/Three.js-Node-Material)).

**Model:** signal = uniform; field = texture or attribute; time = clock; feedback = render target; state = objects and uniforms; reuse = classes and R3F components; debug = Spector and console; live = HMR.

**Breaks:** `onBeforeCompile` string surgery is brittle; disposal is manual; post-processing chains are fiddly; WebGL/WebGPU divergence.

**Do not copy:** shader string patching.

### Modular synthesizers

**Borrow:** voltage control, one cable per value, attenuverters on every input, and a hard distinction between continuous CV, gates and triggers. A patch is a live instrument, not a document ([Doepfer manual](https://doepfer.de/a100_man/a100t_e.htm)).

**Model:** signal = CV/gate/trigger; field = not applicable; time = continuous plus clock; feedback = patch cable with inherent delay; state = sample-and-hold, sequencer, delay; reuse = modules, not patches; debug = scope and multimeter; live = the point.

**Breaks:** cable spaghetti; no recall or undo; gain staging and clipping; no type safety; tuning drift.

**Do not copy:** unlabeled cables or no recall.

## 4. Cross-cutting failure patterns

**F1. The everything-graph.** `INFERENCE` Every system that shows the whole computation becomes unreadable around 50 nodes: TouchDesigner, Max, Pure Data, vvvv, cables.gl, Blender. Survivors add grouping, typed ports, search, collapsing and per-node previews. RE's stacks will hit this immediately.

**F2. Feedback is the fault line.** `EXTERNAL RESEARCH + INFERENCE` Systems that hide feedback (ShaderToy multipass, TouchDesigner target, Houdini solver) produce self-organization; systems that forbid it (Substance Designer, Shader Graph) cannot. But hidden feedback is where reproducibility dies. The contract must be explicit edge, delay, reset and seed.

**F3. State is either explicit or a bug.** `FACT + INFERENCE` Blender's Simulation Zone and Houdini's Solver SOP thread state; TouchDesigner's Feedback TOP and ShaderToy's buffers hide it. RE has `seed` and `resetToken` in RD, but no general state contract across signals, modifiers and feedback.

**F4. Rate confusion.** `INFERENCE` Max and vvvv succeed by naming rates; Processing and Three.js blur them. RE has project time, timeline, physics and simulation iterations; without a rate label on every port, "why did it jump" is unanswerable.

**F5. Reuse is a type problem.** `FACT + INFERENCE` Typed subgraphs (Blender, Unity, vvvv) scale; copy-paste (ShaderToy) and opaque blocks (Notch) do not. RE's shared effect stacks are a good start, but lack typed inputs and exposed parameters.

**F6. Debugging is per-edge, not per-node.** `EXTERNAL RESEARCH` The best debugging is a viewer or probe on every wire plus a spreadsheet for per-element data (TouchDesigner, Houdini, Blender). Console logs are the worst.

**F7. Live editing splits into hot and cold.** `INFERENCE` Parameter edits should preserve state; topology edits must declare whether they reset, migrate or invalidate. None does this perfectly; Resolume/Notch lead on performance, Blender/TouchDesigner on re-evaluation.

## 5. Confidence and open questions

`INFERENCE` Confidence: high on documented behavior, medium on scale-failure claims (design experience, not measurement), low on whether users want a visible graph — R19 decides. Open: Feedback Edge as modifier or node; field cardinality per-object or per-pixel; mutation lineage as history or seed; probe panel before a larger catalog.

## 6. Lessons table

| System | Transferable lesson | Explicitly avoid | MVP |
|---|---|---|---|
| TouchDesigner | Per-edge viewer; explicit feedback + reset | Operator families; global paths | Adopt |
| Houdini | Attributes as fields; solver state as data | Context zoo; node-per-operation | Adapt |
| Notch | Exposed parameters; cloner/effector split | Opaque blocks; hierarchy drawn as wires | Adapt |
| vvvv | Explicit cardinality; HoldLatest/Sampler/S+H | Implicit broadcast; paradigm leak | Adopt |
| Max/MSP | Message vs signal rates; poly~; delay-line feedback | Hidden order; global send/receive | Adopt |
| Pure Data | Clone; tiny primitives | Untyped ports; print-only debug | Adapt |
| Resolume | Quantized triggers; performance macros | Layer-only ontology | Adapt |
| Blender | Sim-zone state in/out; fields; spreadsheet | Attribute-domain leakage | Adopt |
| Niagara/PCG | Staged spawn/update/render; capacity | Namespaces; engine coupling | Adapt |
| Unity VFX/Shader | Blackboard; typed ports; previews | Fixed context pipeline | Adapt |
| Substance Designer | Determinism; graph instances | Functional-only model | Reject |
| Cavalry | Duplicator = structure × field; spreadsheet | Timeline-only | Adapt |
| Processing | Sketch ceremony; code escape hatch | Global state; restart-to-edit | Adapt |
| openFrameworks/Cinder | Native escape hatch | Native toolchain requirement | Reject |
| Hydra | Stable IDs; layers/overrides; lazy evaluation | USD composition complexity | Reject |
| ShaderToy | Buffer ping-pong; reset/seed; URL sharing | Global uniform soup | Adopt |
| cables.gl | Small ops with previews; shareable patch | Lock-in; opaque ops | Adapt |
| PlayCanvas | Editor/runtime split; asset handles | Scene graph as truth | Adopt |
| Three.js | Typed node materials; explicit disposal | Shader string surgery | Adopt |
| Modular | Attenuverters; CV/gate/trigger; macros | Cable spaghetti; no recall | Adopt |

## 7. MVP classification

**Adopt now — the contracts that unlock self-organization without a larger node catalog:**

1. **Feedback Edge.** A first-class connection with `delay`, `reset`, `seed` and a visible buffer. Benefit: composable, reproducible feedback. Cost: medium. Risk: double-buffer bugs. `PROPOSAL`
2. **Signal/Field contract.** Every port declares kind (scalar, field, event, geometry), domain (object/world/screen) and cardinality. Benefit: no silent no-ops. Cost: medium. Risk: over-typing. `PROPOSAL`
3. **State Schema.** Each simulation declares inputs, outputs, step, seed and reset policy. Benefit: reproducibility across project switches. Cost: low-medium. Risk: migration. `PROPOSAL`
4. **Probe/Provenance panel.** Any edge's last value, source and step time; spreadsheet for fields. Benefit: debugging. Cost: medium. Risk: performance. `PROPOSAL`
5. **Exposed Parameter surface.** Live-controllable parameters with ranges and macros. Benefit: performance, MIDI/OSC. Cost: low. Risk: scope creep. `PROPOSAL`

**Adapt later:** spread vectorization, staged particles, USD-like overrides, TSL node materials, HDA-like components, PCG-style scattering, quantized triggers.

**Reject for MVP:** operator-family taxonomy, full DCC contexts, USD composition, engine coupling, code-only or node-only authoring, layer-only compositing, fixed particle pipelines, global uniforms, untyped ports, cable spaghetti, native C++.

**Key lesson:** the best systems have the clearest contracts for *what a value is, when it is evaluated, and what state survives* — not the most nodes. RE should differentiate on inspectable self-organization, not a bigger catalog.
