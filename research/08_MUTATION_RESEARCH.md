# 08 — Mutation Research

Detailed investigator report: `investigators/R09_R10_mutation_time.md`.

## Current implementation (FACT)

- `mutationEngine.ts` seeded PRNG (mulberry32-like).
- Mutates numeric modifier values, modifier-output connections, adapters, geometry order, time params, mapping, RD feed/kill.
- Validates cycles via `wouldCreateModifierCycle`.
- Clamps clone count to 200; clamps RD iterations; does not reset RD state by default.
- `Project.mutation` stores accepted records with before/after serialized configs, seed, depth, scope, branch ID, parent ID, diff.
- UI `MutationBar` offers MUTATE, depth/scope, KEEP, AGAIN, BRANCH, REVERT, hidden developer diff.
- KEEP uses store transaction; REVERT restores config snapshot; BRANCH changes branch ID in same project.

## Strengths

- Deterministic candidate seed.
- Does not require understanding a generator catalog.
- Reinforces “controlled loss of control.”
- Internal diff supports reproducibility/debugging.
- Uses existing project snapshots and Undo.

## Weaknesses

- Mutation scope is limited mostly to modifier/RD values; material/light/post/shader/time topology are underrepresented.
- No novelty/diversity tracking; random choices can cluster.
- No objective function, correctly, but also no “distance from current” metric beyond depth.
- No branch-per-project/lineage graph; branch ID only.
- Seed is not controlled/exposed; `Again` generates a new seed rather than replaying.
- `accepted` records are never read by a lineage UI; before/after snapshots are strings.
- Full-range value sampling means mutations are large jumps, not local nudges.
- 64 records × two full snapshots can exhaust localStorage (order-of-magnitude, project-size dependent).
- Before/after snapshots are large JSON strings in localStorage; multiple records can bloat storage.
- `AGAIN`/`REVERT` rely on component-local `pending`, not durable session state.
- Mutation can create visually invalid/extreme results that are technically valid but not screened for perceptual value or resource cost (beyond some clamps).
- Shared Look scope exists in engine but not fully tested.
- No checkpoints for RD/post/physics state; mutation only config.

## Research directions

### Interactive evolutionary computation
Keep human as fitness function; no automatic objective. Present one candidate at a time; KEEP/AGAIN/BRANCH is sufficient. Optional “lineage map” for navigation.

### Quality-diversity / MAP-Elites
Could maintain an archive of accepted mutations keyed by perceptual/structural descriptors (symmetry, density, color, motion energy, simulation regime). Do not expose as optimization; use to suggest less-obvious candidates and avoid duplicates.

### Graph mutation
Mutations should operate on real graph topology with stable IDs and compiled validation before apply. Prefer replacing sources/adapters/edges over adding random nodes. Avoid cycles; temporal nodes are explicit exceptions.

### Novelty search
Measure novelty in feature space, not parameter space: visual embeddings / histogram / edge density / motion. In-browser, cheap perceptual hashes or low-res frame statistics are feasible.

### Lineage
Store parent ID, branch ID, seed, diff, checkpoint references. Provide a compact tree, not verbose logs. Branch should eventually create a separate project or checkpoint lineage without destroying parent.

## Numerical/resource policy

- Keep clone counts, RD resolution/iterations, texture sizes bounded.
- Do not clamp artistic values globally; use shader-safe math and graceful fallback.
- Validate compilation and graph before mutating project state; discard failed candidate.
- Do not reset RD/post history unless mutation requires incompatible structural state; record resets explicitly.

## MVP classification

CORE: seeded value/connection/stack mutation; KEEP/AGAIN/REVERT; internal diff; no reset RD.
NEAR-TERM: material/light/post mutation; branch lineage UI; checkpoint references.
EXPERIMENTAL: MAP-Elites/novelty archive; graph-topology proposals.
LATER: AI-driven mutation.
