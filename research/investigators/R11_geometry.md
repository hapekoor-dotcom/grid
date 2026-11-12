# R11 — Geometry / Modifiers

FACT: 22 ordered geometry ops in shader (`uGeoOp0..15` scalar floats + float count after P0 fix); authored order preserved within geometry.
FACT: geometry modifier stack drives vertex displacement and motion; clones are runtime entities (200 cap), not instancing.
FACT: effective bounds/picking use conservative expansion from modifier strength/radius/clone distribution.
FACT: geometry rebuild for object structure; shader assignment can also rebuild due signature.
FACT: normals are not recalculated after deformation; material lighting may look wrong; cull disabled.
PROPOSAL: normal recomputation strategy, true effective bounds/GPU picking, instancing, modifier audit.
