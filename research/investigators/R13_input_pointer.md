# R13 — Input / Pointer

See `../05_INPUT_POINTER_AUDIT.md`.

FACT: runtime has `interactionOwner` NONE/SELECT/SELECT_MARQUEE/GIZMO/CAMERA/UI; plan/timeline/dialogs/graph have independent pointer state.
FACT: viewport LMB selection/marquee; MMB/RMB camera; LMB double-click camera removed; F/Shift+F framing hardened.
FACT: no global pointer arbiter; App modal flag list is fixed; invisible overlays can capture.
FACT: lostpointercapture/blur/Escape reset viewport; plan/timeline use capture.
PROPOSAL: global InputArbiter, modal acquire/release, overlay portals, 50-cycle stress test.
