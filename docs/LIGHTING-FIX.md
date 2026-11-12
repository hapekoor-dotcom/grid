# Lighting fix pass

Scope: shared PlayCanvas lighting for all fixture categories. No engine/UI/JSON changes.

## Root causes found

1. **Side view was not dark lighting — it was a camera occluded by the room wall.** The side preset sat at `bounds.maxX + 9`, outside the room, looking through an opaque wall. Moved the side camera inside the room (`maxX - 1.2`). This removed the “top bright / side black” split.
2. **Fixture gains were arbitrary per branch.** Bar area lights used 3.2, heads 10, and PARs were projected through very wide optics at the same gain, so the PAR flooded the floor while bars barely registered. Normalized to bar 9, PAR 1.5, beam 6, head/spot 8, with ranges 13 m (bars) / 22 m (fixtures).
3. **Shadow/cookie artifacts.** Bar cookies and bar shadows created circular/dark patches and hard volume boundaries; shadow maps from the floor-level PAR/beam cut a large dark wedge. Disabled fixture shadows for now and removed area-light cookies. This is a deliberate tradeoff: no shadow artifacts, but no cast shadows until a dedicated soft-shadow pass.
4. **Surfaces had no usable indirect fill.** Ambient was 0.12 and the directional fills were weak; walls/floor disappeared. Raised ambient to 0.22 and diffuse-only fills to 0.65/0.50. Exposure/tonemapping unchanged.
5. **Fog was doing most of the contrast work.** Lowered density (`haze * 0.0035`) and local intensity (`0.55`) so local light shafts do not clip into solid cones. `?fog=0` isolates the fog contribution.
6. **Emissive and bloom were mixed into the same perceived brightness.** Added `?glow=0` to disable bloom and lens emissive for diagnosis; the test screenshots show fixtures still illuminate surfaces with emissive/bloom off.

## Test scene

`?lighttest=1` adds a neutral floor and three walls and allows all fixture categories. The test project (not committed) has:

- Wash Head (snl-444)
- Spot (snl-470)
- Beam (snl-445)
- PAR (snl-450)
- LED Bar (snl-499)

Screenshots:
- `light-test-perspective.png`
- `light-test-top.png`
- `light-test-side.png`
- `light-test-nofog.png`
- `light-test-noglow.png`

## Changed files

- `app/src/components/view3d/playcanvasRuntime.ts`
  - test mode / neutral test room
  - fog and glow query flags
  - normalized gains/ranges
  - side camera inside room
  - surface ambient/fill
  - disabled bar cookies/shadows and fixture shadows

## Remaining

- Shadow quality is currently off; a follow-up should add one soft key shadow at a time and inspect frustum/bias, not re-enable all fixture shadows.
- Bar and PAR surfaces still need per-category photometry; this pass only removes the worst imbalance.
- Existing Rig Grid scene is bars+heads only after the previous removal, so BEFORE/AFTER in Photo mode is not a meaningful room-lighting comparison until the venue is restored.
