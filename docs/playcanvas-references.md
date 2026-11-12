# PlayCanvas reference implementations used

This editor adapts official PlayCanvas implementations. Paths are relative to
`/home/hapekoor/Desktop/playcanvas-engine-reference/`.

| Feature | Official reference |
| --- | --- |
| Move gizmo | `examples/src/examples/gizmos/transform-translate/example.mjs` |
| Rotate gizmo | `examples/src/examples/gizmos/transform-rotate/example.mjs` |
| Scale gizmo | `examples/src/examples/gizmos/transform-scale/example.mjs` |
| Orbit camera (fallback) | `examples/src/examples/camera/orbit/example.mjs` and `scripts/esm/camera-controls.mjs` |
| Pointer-lock fly | Adapted from `examples/src/examples/camera/fly/example.mjs`; uses the browser Pointer Lock API and PlayCanvas camera transforms |
| Performance statistics | PlayCanvas `AppStats` (`app.stats`, `gpuFrameTime`, `vramTotalBytes`), based on `examples/src/examples/debug/mini-stats/example.mjs` |
| Cameras / lights / post | `playcanvas-skills-reference/skills/light-scene/SKILL.md`, `apply-conventions/SKILL.md`, `build-app/SKILL.md` |

## Adaptation notes

- `CameraControls` is instantiated from `playcanvas/scripts/esm/camera-controls.mjs` with `enableOrbit: true`, `enableFly: false`, `leftButton: 'orbit'`, `rightButton: 'pan'` for unlocked navigation.
- Pointer-lock fly disables CameraControls while active; Escape/pointer-lock loss returns to orbit at the current camera pose.
- There is never more than one controller writing the camera pose.
- `TranslateGizmo`, `RotateGizmo`, and `ScaleGizmo` share one `Gizmo` layer and operate on the semantic scene root for the selected object.
- Gizmo pointer events disable `CameraControls` only when a gizmo handle is hit.
- Model roots carry the authored scale so the official ScaleGizmo writes the same `object.scale` data as the inspector.
- Quality presets set CameraFrame render scale, TAA, volumetric step counts, shadow availability and atlas sizes; low starts with its cheap configuration before the first frame.
