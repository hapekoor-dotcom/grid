# 02 — State Ownership and Source-of-Truth Matrix

## Purpose

This document distinguishes authoritative project state, derived runtime state, GPU state, UI state and temporal state. The central risk in RE is not simply duplicated state; it is that **runtime state looks authoritative to the user while being invisible to persistence and Undo**.

## State matrix

| State | Current owner | Persistent | Undo | Rebuilt/invalidated by | Risk |
| --- | --- | --- | --- | --- | --- |
| Projects | `workspaceStore.projects` | localStorage | yes, per-project snapshots | init/import | Whole workspace serialized synchronously. |
| Active project | `workspaceStore.activeId` | workspace file | n/a | open/create/delete | Runtime may still hold old project until setProject. |
| Object transforms | `SceneObject` | yes | yes | store mutation → `setProject` | Geometry signature excludes transform; fast path applies transforms. |
| Object visibility/lock | `SceneObject` | yes | yes | fast path/rebuild | `modelVisible` excluded from signature in one place but included elsewhere. |
| Materials/Looks | `SceneObject`, `MaterialLook` | yes | yes | `applyMaterialOverrides` signature | Material signature ignores modifier shader effects. |
| Custom shaders | `Project.customShaders` | yes | yes | `updateCustomShaders` | Asset creation triggers project sync; careful invalidation required. |
| Shader instances | object/look `shaders` | yes | yes | geometry signature via unexcluded `shaders` | Assigning shader causes full rebuild. |
| Post shader instances | `Project.postShaders` | yes | yes | `RendererPostEffect.sync` | Failed pass mapping uses stack index, not active built index. |
| Signals | `Project.signals` | yes | yes | signal evaluator each frame | No persistent runtime signal state; mostly stateless. |
| Graph modulators | `SceneModifier.modulators`, `ShaderInstance.modulators` | yes | yes | recursive evaluator | No single compiled graph; cycles guarded only in UI/recursive evaluation. |
| Field links | `Project.fieldLinks` | yes | yes | `syncModifierVisuals` reads output params | Field link target lookup is modifier-id based; Shared Look duplicates carefully patched but still ambiguous. |
| RD config | `Project.reactionDiffusion` | yes | yes | `RD.update` sees config | RD texture state is not persisted; resetToken controls reset. |
| RD GPU state | `ReactionDiffusionRuntime` | no | no | config resolution/seed/resetToken | Lost on reload; intentionally temporal. |
| RD scalar provider | module-global `reactionField.ts` | no | no | runtime init/destroy | Global provider can stale if multiple runtimes exist. |
| Physics bodies | `PlayCanvasRuntime` | no | no | rebuild/update | Physics state not serializable; clone/object lifecycle. |
| Physics signal state | `lib/physics.ts` module state | no | no | impact decay | Global across projects unless reset; leakage risk. |
| Camera | `PlayCanvasRuntime` + CameraControls | no | no | resize/fit/explicit commands | Mode switch re-creates camera; camera not saved. |
| Post intermediate targets | `RendererPostEffect` | no | no | structural sync/resize | No explicit destructor call from runtime destroy found. |
| Post history targets | `RendererPostEffect` | no | no | history reset/pass rebuild | Reset semantics are pass-scoped but stack index mapping is fragile. |
| TAA history | CameraFrame | no | no | resetTaaHistory/rebuild | Reset reason tracked; no persistence. |
| Selection | `uiStore.selectedIds` | no | no | select/clear/prune | Runtime receives only after React effect. |
| Hover | Runtime + `uiStore.hoveredObjectId` | no | no | pointer moves | Duplicated hover sources. |
| Pointer owner | Runtime | no | no | pointer lifecycle | No central owner across DOM/plan/timeline/gizmo. |
| Modals | `uiStore` flags | no | no | UI actions | App shortcuts only know a fixed flag list. |
| Autosave dirty | `workspaceStore` | workspace file | n/a | every mutation | Autosave serializes whole project 700ms after each change. |
| Mutation lineage | `Project.mutation` | yes | yes | mutation actions | Has large before/after JSON snapshots. |
| Mesh capabilities | `uiStore.meshCapabilities` | no | no | runtime report | Cleared/recomputed on rebuild only. |
| Diagnostics | Runtime fields | no | no | every frame/action | Not project-scoped. |

## Authoritative vs derived

Authoritative project data:

- object records, transforms, material overrides, Looks
- shader assets and instances
- post stack
- signals, modulators, graph connections
- RD configuration
- timeline, view, settings
- mutation lineage

Derived runtime data:

- PlayCanvas entities
- installed materials
- GPU shader variants
- pick targets and screen bounds
- RD textures and readback cache
- post render targets and history
- TAA history
- clone entities
- hover/selection marker
- camera state (partly user intent, not saved)

## Duplicate sources of truth found

1. **Object selection**: `uiStore.selectedIds` and `PlayCanvasRuntime.selectedIds`. Runtime is a mirror updated by effect.
2. **Hover**: `uiStore.hoveredObjectId` (plan) and runtime `hoverId` (3D).
3. **Materials**: project material overrides, Look material, cloned PlayCanvas material, and shader-installed material.
4. **Shader targets**: `shaderEffectTargets`, `materialTargets`, source material references and clone materials.
5. **RD sample provider**: global module singleton plus runtime RD instance.
6. **Post stack state**: `Project.postShaders` vs `RendererPostEffect.stack` vs built `passList`.
7. **Graph routing**: `ParameterModulator`/`FieldLink` vs `graphRouting` adapters vs `ModifierGraphDialog` UI labels.
8. **Camera fit intent**: `uiStore.cameraFocusId`/`fitRequest` vs explicit runtime calls; legacy paths still exist.
9. **Simulation time**: renderer `animTime`, timeline time from `timelineClock`, RD update time `animTime + dt`, post time `frame.time`, physics dt. No canonical clock.

## Ownership recommendation

- Make **Project** the only configuration authority.
- Make **RuntimeSession** an explicit, versioned, non-persistent owner of camera, GPU resources, physics, post history, RD state and diagnostics.
- Introduce an explicit **Capture/Checkpoint** object for state that must survive reload (RD texture, post history, physics state, mutation lineage) if RE wants exact visual reproducibility.
- Emit explicit invalidation events: `post.structure`, `shader.instances`, `look.changed`, `rd.config`, `quality`, `resize`.
- Stop inferring all change classes from a giant JSON signature.
- Centralize pointer/input/modal ownership in one state machine.

## Evidence

- `workspaceStore.ts` state and actions
- `uiStore.ts` state
- `playcanvasRuntime.ts` private fields, `setProject`, `rebuild`, `destroy`
- `RendererPostEffect.ts`
- `ReactionDiffusionRuntime.ts`
- `reactionField.ts`
- `physics.ts`
