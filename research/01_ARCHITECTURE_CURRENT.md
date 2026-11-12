# 01 — Current Architecture

Status: first-pass verified reconstruction
Evidence cut: repository state at commit `6964523`

## Executive reconstruction

RE:MORPH is currently a **React 19 editor shell wrapped around one monolithic PlayCanvas 2.24 runtime**, with project state in a single Zustand store. The runtime owns a large amount of transient state that is not represented in `Project`: camera, picker, materials, shader targets, clones, physics bodies, RD state, post history, TAA history, selection marker, hover marker, pointer state and input debug.

The product has two historical rendering stacks in the repository:

1. the active PlayCanvas 3D stack (`PlayCanvasViewport` → `PlayCanvasRuntime`);
2. a legacy React Three Fiber / Three.js stack (`StageScene.tsx`, `FixtureLight.tsx`, `VolumetricBeam.tsx`, `VolumetricScattering.tsx`, `SeatingMesh.tsx`, `FixtureModel.tsx`) that is no longer imported by the application shell.

The legacy stack is still a dependency and build cost but is not part of the current runtime path. This is a major source of architectural ambiguity and bundle/mental overhead.

## Major modules

| Module | Approx. size | Responsibility |
| --- | ---: | --- |
| `app/src/components/view3d/playcanvasRuntime.ts` | 4,368 lines | Whole 3D runtime: WebGL init, scene construction, materials, lights, modifiers, shaders, picking, input, physics, camera, diagnostics, save-independent runtime state. |
| `app/src/store/workspaceStore.ts` | 1,342 lines | Projects, Undo/Redo, project CRUD, object transforms, materials, Looks, modifiers, shaders, post stack, signals, RD config, persistence. |
| `app/src/store/uiStore.ts` | ~315 lines | Selection, mode, tool, modal flags, panel layout, hover, toasts, camera fit requests. |
| `app/src/components/view3d/PlayCanvasViewport.tsx` | 433 lines | React↔runtime bridge, asset URL loading, overlays and dialogs, F-key framing, screenshot/download. |
| `app/src/components/view3d/RendererPostEffect.ts` | 324 lines | CameraFrame resolve effect, custom post pass targets, history copy passes, diagnostics. |
| `app/src/components/view3d/ReactionDiffusionRuntime.ts` | 302 lines | Separate raw-WebGL2 Gray-Scott ping-pong simulation. |
| `app/src/components/view3d/modifierShader.ts` | ~1,100 lines | Vertex/fragment chunk library for geometry, surface, RD and material effects. |
| `app/src/lib/modifiers.ts` | ~1,240 lines | 90+ modifier definitions, fields, defaults, stages, domains. |
| `app/src/lib/signals.ts` | 210 lines | Signals, modulation evaluation, recursive modifier-output routing. |
| `app/src/lib/graphRouting.ts` | ~180 lines | Port types, adapters, cycle checking, graph ordering. |
| `app/src/lib/customShaders.ts` | ~360 lines | Shader Lab defaults, post presets, validation scaffolding, shader templates. |
| `app/src/lib/mutationEngine.ts` | new | Seeded modification of values/connections/adapters/stack/time/mapping/RD config. |

## Initialization path

FACT: `App` calls `useWorkspaceStore.init()`; `init()` loads the workspace from `localStorage` through `loadWorkspace()`.
FACT: `AppShell` mounts `PlanEditor` for plan mode and lazy-loads `PlayCanvasViewport` for other modes.
FACT: `PlayCanvasViewport` constructs one `PlayCanvasRuntime`, exposes it as `window.__RE_RUNTIME__`, and calls `runtime.init()`.
FACT: `PlayCanvasRuntime.init()` creates the PlayCanvas graphics device, `AppBase`, camera, CameraControls, gizmos, `CameraFrame`, RD runtime and `RendererPostEffect`, then starts `app`.
FACT: Runtime destruction occurs when `PlayCanvasViewport` unmounts or when React's effect dependency identity changes. Switching plan ↔ 3D unmounts the runtime and recreates it.

## Dependency direction

Intended direction:

```text
React UI / Zustand
        ↓
PlayCanvasViewport bridge
        ↓
PlayCanvasRuntime
        ↓
PlayCanvas + raw WebGL2 RD
```

Actual direction is weaker than intended:

- `playcanvasRuntime.ts` imports and calls many pure libraries, but also interprets project UI concepts.
- `RendererPostEffect.ts` imports signals, timeline sampling, custom shader compilation and project types directly.
- `ReactionDiffusionRuntime.ts` imports signal/modulated config and a global sample provider (`reactionField.ts`).
- `workspaceStore.ts` imports UI store for selection and mode; UI state and project state are coupled at action boundaries.
- `GraphRouting`, `modifierOutputs`, `signals`, `mutationEngine` are partly pure, but runtime and UI duplicate some graph/port assumptions.

## Lifecycle and invalidation

FACT: `setProject()` computes `projectGeometrySignature()`; if unchanged it takes a fast synchronization path, otherwise `rebuild()` destroys the entire world and reconstructs every object, material and pick target.
FACT: `rebuild()` resets TAA history and all runtime scene maps; it does not destroy or reset the RD runtime or `RendererPostEffect` object.
FACT: `cameraFrame.update()` is called on rebuild, on structural post changes (`RendererPostEffect.sync`), on quality changes, on fog signature changes and on resize; it is intentionally no longer called on arbitrary project edits.
FACT: The geometry signature deliberately excludes light, model visibility, transforms, modifiers and materials, but **does not exclude `shaders` or `lookId`**. Assigning a mesh shader or Look can therefore trigger a full world rebuild.

## Architectural assumptions that are currently weak

1. **One runtime object owns too much.** Input, rendering, materials, physics, picking, camera, diagnostics and project synchronization are one class. It is difficult to test independently.
2. **Project-state changes are detected by JSON signatures rather than explicit invalidation events.** Signature gaps cause either full rebuilds or missed updates.
3. **Runtime state is invisible to the store.** Camera, TAA, RD, post history, clones and physics are not first-class project/runtime state.
4. **CameraFrame/post/RD coexist without one explicit resource owner.** RD is raw WebGL2; post is CameraFrame; TAA is CameraFrame; fog/bloom are CameraFrame; renderer lifecycle is runtime.
5. **Two rendering stacks exist.** Three.js/R3F code is dead but still installed and confusing.
6. **The editor is a single large Zustand store plus local component state.** Modal/input ownership is not centralized.
7. **Graph/field/picking expansion is bolted onto a scene editor designed around rigid stage objects.** Concepts are accumulating without a unified data/execution model.

## Positive architecture worth preserving

- Renderer-owned CameraFrame post stack is the right integration point; it avoids a second WebGL context.
- Raw-WebGL RD ping-pong is isolated and small enough to be replaced behind a better interface.
- Project state is serializable and cloneable; Undo via project snapshots is simple and robust for an experimental editor.
- GPU field routing avoids CPU readback for spatial effects.
- Modifier definitions, signal evaluation and graph routing are mostly pure libraries and can be extracted.
- Existing E2E work covers pointer, post identity, geometry lifecycle, RD, graph, clone count and shader safety.

## Key unanswered questions

- Should the runtime be a stable long-lived scene service rather than re-created on every mode switch?
- Which state belongs to the project, which to a runtime session, and which to a capture/checkpoint?
- Can the current `PlayCanvasRuntime` be decomposed without losing the immediate feedback loop?
- Is the legacy Three.js stack intentionally retained for a future mode, or dead code to delete?

## Evidence

- `app/src/components/shell/AppShell.tsx`
- `app/src/components/view3d/PlayCanvasViewport.tsx`
- `app/src/components/view3d/playcanvasRuntime.ts:init`, `setProject`, `rebuild`, `destroy`
- `app/src/store/workspaceStore.ts:init`, `mutate`, `persistNow`
- `app/package.json`
