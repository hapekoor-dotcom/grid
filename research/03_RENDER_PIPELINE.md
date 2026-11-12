# 03 — Render Pipeline

## Reconstructed path

FACT (from initialization and effect registration):

```text
PlayCanvas AppBase scene
  → CameraFrame scene render (HDR)
  → CameraFrame TAA (optional)
  → CameraFrame effects in resolve order
       → RendererPostEffect (custom post stack)
            pass 1 → target 1 → copy pass → history 1
            pass 2 → target 2 → copy pass → history 2
       → scene.texture = finalTarget.colorBuffer
  → CameraFrame bloom / fog / grading / color enhance / vignette
  → tone mapping (ACES)
  → dither effect (CameraFrameEffect at COMPOSESLOT_OUTPUT)
  → CameraFrame compose
  → backbuffer
```

This order is inferred from `frame.addEffect(postEffect)` before `frame.addEffect(ditherEffect)` and from CameraFrame effect stages. The exact CameraFrame internal pass ordering depends on PlayCanvas 2.24; it should be verified against the installed engine if the team changes composition.

## CameraFrame facts

- `frame = new pc.CameraFrame(app, camera.camera)`.
- `postEffect` is a `CameraFrameEffect` with `requires: [FRAMERESOURCE_DEPTH]`.
- `ditherEffect` is a `CameraFrameEffect` with `slot: COMPOSESLOT_OUTPUT`.
- `frame.rendering.toneMapping = TONEMAP_ACES`.
- `frame.rendering.renderFormats = [RGBA16F, RG11B10F, RGBA8]` on init; quality changes alter preference.
- TAA disabled initially; quality/AA can enable it.
- `frame.volumetricFog`, `bloom`, `colorEnhance`, `vignette`, `sharpness` are configured directly.
- RD is **not** a CameraFrame effect. It is raw WebGL2 using the PlayCanvas device's GL context and `pc.Texture.impl._glTexture`.

## Custom post resource facts

`RendererPostEffect.createPasses`:

- width/height = backbuffer × `rendering.renderTargetScale`
- intermediate format is now hard-pinned to `RGBA16F`
- texture explicit: no mipmaps, `srgb:false`, linear filtering, clamp address
- output target per pass, plus one history target per pass
- one copy pass per pass copies current output to history
- `passes.resolve.push(pass, copyPass)` for each enabled stack entry
- first pass reads `scene.texture`; subsequent passes read previous target
- final pass target becomes `scene.texture`

## Failure modes in the pipeline

1. **Stack-index mapping**: `createPasses` drops failed passes from `built`, but `this.stack` still contains them. `resolveScene` and `frameUpdate` index `this.stack[index]` against shortened `passList`. A failed first pass shifts all later pass uniforms/history semantics.
2. **Resize**: `frameUpdate` detects size mismatch and schedules `cameraFrame.update()` via rAF; there is a window where pass widths differ from backbuffer.
3. **History**: copy pass shader originally sampled `uSource` without binding; fixed. Selective opacity chunk is now conditional. History is still one-frame copy, not a robust double-buffered history.
4. **Post destruction**: `RendererPostEffect.destroyPasses()` exists, but `PlayCanvasRuntime.destroy()` does not call `postEffect.destroy()` explicitly. CameraFrame.destroy may or may not destroy child effects; needs verification. Textures can leak on mode switch.
5. **RD lifetime**: `runtime.destroy()` does not call `rd.destroy()`. RD textures/framebuffers leak on 3D→plan transitions.
6. **Color space**: post intermediates now linear RGBA16F; final composition/tone mapping happens after. Do not introduce sRGB intermediates.
7. **Alpha**: passthrough preserves source alpha; forcing alpha should not be reintroduced without identity test.
8. **Effect registration count**: diagnostics report one registration. The runtime must never add the custom post effect twice.

## HDR and formats

- Scene `CameraFrame.hdrFormat` observed as RG11B10F in headless test; high quality can use RGBA16F.
- Post intermediates are RGBA16F regardless of scene format.
- RD textures are RGBA16F, nearest-filtered.
- `displayFormat: DISPLAYFORMAT_HDR` requested from PlayCanvas.
- `colorEnhance` and `grading` are enabled/disabled separately; grading is disabled initially.
- Dither is a camera-frame output effect, not a post pass.

## Passthrough invariant

FACT: After the post rewrite, a dedicated test compares no-post vs passthrough with canvas screenshots and reports:

```text
0% changed pixels, max channel delta 3
```

This is the hard baseline. Any post change must keep this test green.

## Resources table

| Resource | Creator | Format | Size | Lifetime | Risk |
| --- | --- | --- | --- | --- | --- |
| CameraFrame scene RT | PlayCanvas | HDR selected | render scale | CameraFrame | external |
| TAA history | CameraFrame | HDR | render size | CameraFrame | reset on rebuild |
| Post pass targets | RendererPostEffect | RGBA16F | scaled | until next createPasses/destroy | per-pass |
| Post history targets | RendererPostEffect | RGBA16F | scaled | until createPasses/destroy | one per pass |
| RD state textures | RD runtime | RGBA16F | 32–1024 | until allocate/destroy | nearest, ping-pong |
| RD FBOs | RD runtime | n/a | n/a | until allocate/destroy | raw GL |
| Depth | CameraFrame resource | engine | render size | CameraFrame | post requires depth |
| Dither | CameraFrameEffect | output | screen | runtime | no pass list |

## Recommendations

- Make `RendererPostEffect` own and explicitly expose `destroy()`; call from runtime destroy.
- Map built pass entries with their original instance IDs; never use stack index after failure.
- Add `post.structure` explicit invalidation instead of signature-only.
- Add a numeric HDR identity test, not only screenshot identity.
- Add a render resource inventory to developer diagnostics.
