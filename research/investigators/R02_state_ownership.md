# R02 — State Ownership

See `../02_STATE_OWNERSHIP.md`.

FACT: Project authority is clear for configuration. Runtime authority is not.
Duplicates: selection, hover, materials (project/Look/cloned/shader), shader targets, graph edges, time, RD sample provider.
FACT: RD/post/TAA/physics/clone/camera state is not persisted.
FACT: `Project.mutation` persists full before/after project strings.
FACT: `runtime.destroy()` does not explicitly destroy RD or post effect (ownership unverified).
PROPOSAL: Project = config; RuntimeSession = transient resources; Capture = checkpoint; one input arbiter; one clock; one graph.
