# 17 — Risks and Failure Classes

## Systemic high risks

1. **Pointer death** — multiple owners, modal flags, invisible overlays, camera input block, stale capture.
2. **Renderer magic refresh** — hidden invalidation; Haze/wall/floor controls rebuilding frame.
3. **Temporal poisoning** — stale RD/post history after project switch, resize, shader failure, extreme params.
4. **Project leakage** — runtime texture/material/physics state surviving switch.
5. **Invalid shader output** — chunk duplication, format mismatch, fallback material.
6. **Geometry uniform binding** — ordered ops previously used int array/count; fixed scalar uniforms; still needs invariant tests.
7. **Opaque → transparent** — unconditional opacity chunk fixed; source-transparent materials still intentionally transparent.
8. **NaN/Inf** — transforms, bounds, shader values, camera framing.
9. **Post pass indexing** — failed pass shifts uniforms/history.
10. **Resource exhaustion** — RD 1024×1024×64 iterations, 200 clones, multi-pass RGBA16F.
11. **Schema drift** — new fields dropped by migration/normalization.
12. **Graph cycles** — UI rejects modulator cycles, but raw project/JSON can contain them; runtime stack guard.
13. **Shared Look graph divergence** — IDs cloned on Make Unique; field links patched; still fragile.
14. **Camera teleport** — explicit F/frame and double-click regression; bounds now hardened.
15. **Mutation invalid candidate** — engine validates some cycles but not shader compile or resource all cases.
16. **WebGL context loss** — no explicit recovery path found.
17. **localStorage quota** — no graceful degradation.
18. **Mode switch** — destroys runtime, camera/temporal state lost.

## Failure isolation principles

- Fail local, not global: a broken post pass bypassed; a broken mesh shader falls back to source; a broken object skipped for bounds.
- Never let a UI asset creation mutate runtime.
- Never let unrelated controls force a renderer rebuild.
- Validate before mutating project state.
- Record reset reason and resource owner.
- Prefer stable math/fallback over global clamps.

## Test gaps

- No 50-cycle mixed pointer stress.
- No WebGL context loss test.
- No project switch with active RD/post/physics.
- No GPU resource leak assertion.
- No numeric HDR identity test (screenshot only).
- No shader variant/source hash test.
- No mobile/touch/iframe tests.
