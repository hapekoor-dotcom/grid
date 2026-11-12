# R04 — Shader System

FACT: Shader Lab creates assets via `updateCustomShaders`; asset creation alone does not assign. Assignment writes object/look `shaders` or `postShaders`.
FACT: PBR extension clones StandardMaterial and replaces `transformCoreVS`, `emissivePS`, conditional `opacityPS`; full custom uses `pc.ShaderMaterial`.
FACT: `installShaderEffect` validates custom source before replacing; source material target retained for fallback.
FACT: custom shader assignment is part of geometry signature (not excluded), so it can rebuild the world.
FACT: shader chunk generation is large; include guards were added for reaction declarations; opacity chunk conditional after transparency bug.
FACT: post shaders validate at createPasses; invalid pass bypass; stack indexing bug remains.
FACT: `mesh.cull=false` for shader-deformed meshes.
PROPOSAL: shader variant registry, source hash, explicit per-object shader invalidation, no world rebuild for shader assignment, robust pass mapping.
