# 05 — Input / Pointer Audit

## Scope

Pointer ownership across viewport, gizmos, camera, plan editor, timeline, dialogs, graph, RD painting, mutation bar and overlays.

## Current pointer state machine (viewport)

FACT: `PlayCanvasRuntime` has:

```text
interactionOwner: NONE | SELECT | SELECT_MARQUEE | GIZMO | CAMERA | UI
activePointerId
pressedButtons
pointer {active, button, moved, x, y}
pointerReleased
gizmoDragging
marquee
```

Listener map:

- canvas `pointerdown` → `onPointerDown`
- canvas `pointermove` → `onPointerMove` (hover when inactive)
- canvas `pointerup` → `onPointerUp`
- canvas `pointercancel` → `onPointerUp`
- canvas `lostpointercapture` → reset/cancel
- window `pointerup`/`pointercancel` → `onWindowPointerEnd`
- window `blur` → cancel
- document `visibilitychange` → reset
- window `keydown Escape` → cancel/reset
- canvas `dblclick` → selection only (camera navigation removed)
- gizmo library events (`pointer:down/up`, `transform:*`) → onGizmoStart/Move/End
- canvas `wheel` → no-op (CameraControls handles)
- CameraControls: LMB none, MMB/RMB orbit, Shift+MMB pan.

## Ownership transitions

```text
pointerdown LMB
  gizmo active? ──yes──> GIZMO
  RD paint mode? ─yes──> UI paint, no marquee
  else → SELECT, create potential marquee

pointermove while SELECT:
  buttons 4/2 (MMB/RMB) → CAMERA
  buttons 1 and moved >4 → SELECT_MARQUEE, show rect
  buttons 0 and no marquee → reset

pointerup LMB:
  moved <6 → pickAt (selection)
  moved ≥6 + marquee → selectMarquee
  reset

lost capture / cancel / blur / Escape / visibility:
  cancel gizmo if active, reset pointer
```

## Systemic risks

1. **Two selectors**: plan and 3D each implement selection; UI store is common, but local drag state is not.
2. **Modal flags are a fixed list in App shortcuts**: `App` checks `settingsOpen`, `commandOpen`, etc.; newly added dialogs/overlays can be omitted and receive global shortcuts.
3. **Invisible DOM layers**: viewport controls, fly hint, mutation bar, input debug, dialogs, toasts. CSS `pointer-events` is the only boundary. A transparent overlay can eat LMB without any pointer owner.
4. **Gizmo wrapper**: runtime wraps gizmo `_onPointerDown` and must not double-fire. Library pointer id is manually reset after up.
5. **Pointer capture**: viewport itself does not capture for marquee; it relies on window pointerup. Plan/timeline use capture. A browser losing capture can reset runtime without a matching pointerup.
6. **Focus/blur**: `setCameraInputBlocked` is tied to typing targets and gizmo; modal focus can leave camera disabled.
7. **Double-click**: fixed to selection only, but `onFocus`/`focusObject` remain available and can be reconnected accidentally.
8. **Pointer owner diagnostics**: runtime owner is not aware of plan/timeline/graph/Shader Lab owners; no global owner exists.
9. **Mutation bar**: new overlay with buttons; it should not overlap viewport pointer regions unexpectedly.
10. **Tauri/iframe/pointer lock**: pointer lock escape and lost capture paths need explicit tests.

## Recurring LMB regression class

Historical failures came from:

- per-frame store updates in `updateCamera`/mesh capability collection causing React re-render and pointer state churn;
- `cameraInputBlocked` staying true after modal/gizmo;
- gizmo `_pointerId` not reset;
- stale `pointer.active` after window pointerup;
- invisible overlay/z-index;
- `click` vs `pointerup` double-handling;
- pointer capture owner mismatch.

Current tests cover dialog open/close, marquee, canvas clicks and LMB owner, but not 50-cycle mixed stress, touch, iframe, focus loss mid-marquee, or modal opened while drag active.

## Recommendations

- Create one **global input ownership registry** (`viewport`, `plan`, `timeline`, `graph`, `dialog`, `system`) with explicit acquire/release and a monotonic gesture id.
- Every modal acquires UI ownership on open and releases on close; reset pointer state on acquire.
- Add pointer-event instrumentation to a developer panel: owner, gesture id, capture owner, last 20 events, target element, modal flags.
- Use a single top-level overlay guard (`inert`/`pointer-events`) instead of scattered CSS assumptions.
- Add stress E2E: 50 cycles select→marquee→gizmo→orbit→dialog→select, including pointercancel/lost capture/blur.
- Never let a UI overlay rely on z-index alone; keep it in a portal with explicit pointer-events map.

## MVP classification

CORE MVP: one owner, reset on modal, pointer debug, stress test.
NEAR-TERM: global owner across plan/3D.
EXPERIMENTAL: multi-touch/pen.
