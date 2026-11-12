# R09 / R10 — Mutation as Creative Interaction, and Canonical Artistic Time (Tempus)

Read-only investigation. Scope: `mutationEngine.ts`, `MutationBar.tsx`, `timelineClock.ts`, all runtime time fields. Cross-check: `research/04_TEMPORAL_SYSTEMS.md` (prior note; confirmed and sharpened below).

Labels: **FACT** = read in source. **INFERENCE** = reasoned, not executed. **EXTERNAL RESEARCH** = cited. **PROPOSAL** = recommendation.

---

## Part A — Mutation

### A1. What exists

**FACT.** `mutationEngine.ts` is 194 lines, exporting `mutateProject`, `mutationRecord`, `serializeProject`, over six operators: values (`:63`), connection rewiring (`:83`), adapter (`:101`), stack reorder (`:111`), time params (`:126`), mapping (`:135`). RNG is mulberry32 seeded from a `uint32` (`:25–34`). `mutateProject` clones the project (`:147`), derives an edit count 1–4 from `depth` (`:150–151`), then rolls a weighted operator per iteration (`:155–161`).

**FACT.** Scopes are `object | look | scene` (`:6`); `scene` means the first three visible non-room objects (`:57`), and `object` silently falls back to the first `model` (`:59`). `MutationBar` gives a MUTATE → Keep / Again / Branch / Revert loop (`:96–99`) over real store transactions with an 80-entry undo stack (`workspaceStore.ts:348–369`). The interaction primitive is sound; the machinery around it is not.

### A2. Determinism is nominal

**FACT.** `apply()` calls `mutateProject` with no seed (`:42`), so every mutation draws a fresh random seed (`:145`). The `MUTATION #A1B2C3` label (`MutationBar.tsx:95`) is decoration: no seed field, no copy, no re-run. **"Again" is not replay** — it re-invokes `apply` on the same base (`:58–64`) with a *different* seed. The one action meant to explore a direction cannot reproduce it.

**FACT.** Identity is wall-clock: `id` embeds `Date.now()` (`:176`, `MutationBar.tsx:68`), `createdAt` is an ISO timestamp (`:189`), `branchId` is `randomUUID()` (`:177`). `serializeProject` strips only `mutation` (`:23`, `:36–40`), so snapshots retain `updatedAt`, which every `mutateTransient` bumps (`workspaceStore.ts:344`). Same seed ⇒ different bytes.

**INFERENCE.** The parameter path *is* seed-deterministic (fixed operator order, fixed `rand()` consumption), but nothing can verify or use it, and there is no content hash. **FACT:** `mutationEngine` has no test file, unlike every other non-trivial lib module here.

### A3. The archive is a quota bomb and write-only

**FACT.** `mutation.accepted` keeps 64 `MutationRecord`s (`MutationBar.tsx:71`), each holding two full serialized project snapshots (`types/project.ts:386–404`). A representative project here is ~104 KB (`output/rig-grid-seating.json`), so 64 × 2 × 104 KB ≈ **13 MB per project**. Persistence is `localStorage`, and the store already has a failure branch for it (`workspaceStore.ts:401–404`). **INFERENCE:** ~20 accepted mutations exhaust a 5 MB origin quota (worse in UTF-16), and the visible result is a save that stops working — lost work, not an error dialog. Each MUTATE also `structuredClone`s the whole archive (`:147`).

**FACT.** `accepted` is appended and read nowhere else in `app/src`. `before`/`after` are stored **as strings** and no code parses them back. Lineage exists as bytes, not capability: no history panel, no branch browser, no restore, no export.

### A4. What cannot be mutated

**FACT.** The engine only edits existing parameters and existing edges:

- no add/remove of modifiers, effects, objects, connections, or signals;
- no `SignalSource` mutation (kind, speed, seed, range) — signals only appear as a new modulator's source;
- no object-level mutation (transform, material, look assignment) — `scope: 'object'` edits the modifier stack only;
- no simulation mutation beyond an 18 % chance of nudging global RD `feed`/`kill` (`:76–79`).

**FACT — scope leaks.** That RD write fires regardless of scope (`:76`), so "mutate this look" can silently change the global simulation.

**FACT — one dial, two meanings.** `depth` controls both edit count and structural ambition (value-only below 0.3, `:156`). An artist cannot ask for "one big structural change" or "ten small nudges".

**FACT — values jump.** `mutateValues` samples uniformly across the full physical range and quantizes to `step` (`:42–49`), ignoring the current value. There is no local nudge; nearly every mutation is a large jump, so KEEP does not preserve identity.

**FACT.** `diff` entries are prose (`"stack swap a <> b"`, `"simulation feed/kill perturbed"`) with no ids, no before→after, no machine-readable form — blocking preview, per-item revert, and any archive UI.

### A5. External research

**EXTERNAL RESEARCH.** Interactive evolutionary computation makes human taste the fitness function: generate → judge → breed. Sims' *Genetic Images* is the canonical art instance, and *Evolved Virtual Creatures* mutates morphology **and** control together — the structural axis RE lacks. Electric Sheep distributes the same loop with votes as fitness. ([Sims, Genetic Images](https://www.karlsims.com/genetic-images.html); [Sims, Evolved Virtual Creatures](https://www.karlsims.com/evolved-virtual-creatures.html); [IEC overview](https://en.wikipedia.org/wiki/Interactive_evolutionary_computation); [Electric Sheep](https://electricsheep.org/))

**EXTERNAL RESEARCH.** Novelty search rewards behavioral difference instead of an objective, escaping deceptive gradients ([Lehman & Stanley](https://direct.mit.edu/evco/article/19/2/189/1276/Abandoning-Objectives-Evolution-Through-the-Search)). Quality-diversity keeps an *archive* of distinct high performers binned on user-chosen descriptor axes ([MAP-Elites, arXiv:1504.04909](https://arxiv.org/abs/1504.04909); surveys [arXiv:2012.04322](https://arxiv.org/abs/2012.04322), [Pugh et al.](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2016.00040/full)).

**INFERENCE.** For an instrument, the useful half of QD is the **archive as memory and map**, not optimization. "What have I made, where are the holes" is the artist's question; fitness ranking is harmful here because it tells an artist their taste is wrong.

### A6. Proposals — mutation

| # | Proposal | Benefit | Cost | Risk | MVP |
|---|---|---|---|---|---|
| M1 | **Seed as a real input**: show, copy, pin, edit; `apply(seed)`; Again replays only when pinned, else forks `hash(parent, n)` | Turns a slot machine into an instrument; makes bugs reproducible | S | Low | **CORE** |
| M2 | **Deterministic identity**: `id = sha(seed, baseHash, ops)`; strip `updatedAt`/`createdAt`; store `baseHash` | Enables dedupe, replay verification, tests | S–M | Low; migration | **CORE** |
| M3 | **Stop storing full snapshots**: store op list + base hash, one snapshot per branch; move lineage out of `Project` | 13 MB → KBs; fixes quota loss; cheaper clones | M | Schema migration; gated on M2 | **CORE** |
| M4 | **Two axes**: `amount` (1–N edits) separate from `structure` (value/connection/stack/time/topology) | Restores local search *and* escape | S | Taste call | **CORE** |
| M5 | **Local value mutation by default**: ±small with occasional full-range jump (80/20) | Preserves identity across KEEP | S | Low | **CORE** |
| M6 | **Structural operators**: add/remove modifier, connect a signal, duplicate stack; existing cycle guard | Genuine novelty | M | Cycle/typo risk | NEAR-TERM |
| M7 | **Lock / freeze / solo** per parameter and modifier; mutation respects locks | Strongest creative control in IEC: direction without micromanagement | M | Persist + show in diff | NEAR-TERM |
| M8 | **Visual diff**: before/after thumbnail + changed-parameter list | KEEP/REVERT currently asks memory | M | Capture cost | NEAR-TERM |
| M9 | **Descriptor archive, no ranking**: bin accepted variants on two cheap parameter-space axes, click a cell to restore | Memory + map of explored territory without judging taste | M | Descriptor choice is product-defining; avoid pixel descriptors | EXPERIMENTAL |
| M10 | **Rollback to any record**: re-apply stored ops from a base snapshot; branch from selection | Dead archive becomes a navigable tree | M–L | Needs M2/M3 | EXPERIMENTAL |
| M11 | **Time mutation composes with the clock**: mutate rate/phase/loop, not 40 per-modifier speeds | One move shifts the whole piece in time | S after T1 | Depends on Tempus | EXPERIMENTAL |

**Recommendation.** Ship M1–M5 as one slice: small, stops data loss, and makes the existing loop trustworthy. Defer M6–M10 until Tempus and a state hash exist.

---

## Part B — Time (Tempus)

### B1. Clock inventory (verified)

| # | Clock | Owner | Advances by | Seek/pause | Reset | Feeds |
|---|---|---|---|---|---|---|
| 1 | Frame `dt` | PlayCanvas update (`playcanvasRuntime.ts:422`) | rAF | no | — | all below |
| 2 | `animTime` | Runtime (`:108`), `+= min(dt,0.1)` (`:3521`) | frame dt | no | **`= 0` in buildScene (`:1642`) and rebuild (`:1683`)** | motion/geometry/light/shader params, `uEffectTime` (`:2807`), physics fields (`:3408`), scene stack (`:3446`) |
| 3 | Timeline | singleton `timelineClock.ts:3` | **`TimelinePanel` rAF** (`TimelinePanel.tsx:117–127`) | yes | never on project switch | keyframes/clips, post `sampleTimeline` (`RendererPostEffect.ts:277`), keyframe insert |
| 4 | Post shader | `RendererPostEffect.frameUpdate` | `frame.time` / `performance.now()` (`:278`) | no | effectively never | post `uTime`/`uFrame` |
| 5 | Feedback overlay | `FeedbackOverlay.tsx:128` | `performance.now()/1000` | no | never | 2D feedback displacement |
| 6 | Dither | `playcanvasRuntime.ts:1756`, `:4177` | `performance.now()%64` | no | modulo 64 | temporal dither |
| 7 | RD sim | `ReactionDiffusionRuntime.update` (`:159–220`) | `round(iterations)` steps/frame; step ∝ `dt` (`:178–181`) | `config.paused` only | resolution/seed/`resetToken` (`:165`) | RD textures |
| 8 | Physics | `world.step(1/60, min(0.1,dt)*timeScale, subSteps)` (`:3410`) | fixed substeps + `timeScale` | `paused`, `stepToken` | world rebuild | cannon-es bodies |
| 9 | History epochs | `resetTaaHistory` (`:627–641`), `historyResetToken` | not a clock — an **epoch** | — | toggle/rebuild/resize/teleport (`:1781`, `:4098`, `:4218`) | TAA + post history |

**FACT.** Five different "now"s reach the same frame: `animTime`, timeline time, post `frame.time`, `performance.now()` (#5/#6), and `dt`-integrated sim state (#7). #4 and #5 are monotonic and unresettable, so they cannot be scrubbed, paused, or matched to an edit.

**FACT.** `animTime` resets to 0 on `rebuild` (`:1642`, `:1683`), which fires on geometry-signature change (`:1541–1564`). **Adding an object re-phases every shader and motion animation**, while post, feedback and dither keep their own uptime — a visible desync caused by an unrelated edit.

**FACT — timeline is a UI-owned clock.** `advanceTimeline` is called only from `TimelinePanel`'s effect (`:117–127`); the panel is mounted once (`AppShell.tsx:87`) and only collapses, so this survives by layout accident. Any headless/export path has no timeline clock. Separately, `applyTimeline` calls `setTimelineRange(duration, loop)` **every frame** (`:3166`), re-emitting to React listeners.

**FACT — duplicated state.** `timelineClock`'s `duration`/`loop` duplicate `Project.timeline` (`types/timeline.ts:58–68`), and `time`/`playing` are never reset on project switch (`stopTimeline` is reachable only from the playbar, `TimelinePanel.tsx:204`). **INFERENCE:** switching projects mid-playback carries playhead and play state across; the first frame samples the new project's curves at the old project's time.

**FACT — RD is frame-rate dependent.** Step count is `round(iterations)`; step size scales with `dt` (`:178–181`). No accumulator, no fixed step, no interpolation. At 30 fps the field takes the same step count at roughly double the step size. **INFERENCE:** identical seed + project produce different patterns at different frame rates — the largest obstacle to reproducible mutation.

**FACT — physics is the well-behaved clock:** fixed 1/60 substeps, `maxSubSteps`, explicit `timeScale`, pause, single-step and reset tokens (`:3408–3411`, `types/project.ts:136–145`). Its token pattern is worth generalizing.

**FACT — TAA reset is a workaround:** it toggles `taa.enabled` off/on because CameraFrame exposes no history reset (`:632–640`); triggers are coarse (>8 px resize, renderer recreation, AA mode, teleport), and any world rebuild resets TAA even when only a material changed.

### B2. External research

**EXTERNAL RESEARCH.** Fixed timestep with an accumulator is the standard cure: the renderer *produces* time, the simulation *consumes* it in fixed `dt` steps, leftovers carry forward, and rendering interpolates by `alpha = accumulator/dt`. Exact reproducibility across runs and frame rates requires a fully fixed step, because variadic remainder steps differ in floating point ([Gaffer On Games](https://gafferongames.com/post/fix_your_timestep/)).

**EXTERNAL RESEARCH.** Nested per-component clocks are an established authoring model: TouchDesigner's Time COMP gives each component its own timeline with `play`, `rate`, `start`/`end`, a working range, `loop` vs `hold`, tempo, and a "run independently" flag that detaches from parent transport ([Time COMP](https://docs.derivative.ca/Time_COMP)). **INFERENCE:** RE needs exactly this — a master clock plus domain clocks that inherit transport but may run independently.

**EXTERNAL RESEARCH.** Engines expose time-scale, fixed step, max-step guard and *unscaled* time as one object ([Unity time management](https://docs.unity3d.com/Manual/TimeFrameManagement.html)). **INFERENCE:** unscaled time is the missing concept here — UI, diagnostics and feedback must be immune to artistic rate yet derived from the same source.

**EXTERNAL RESEARCH.** Deterministic replay in games advances simulation on fixed ticks and re-simulates from a stored frame on rollback ([lockstep](https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond), [GGPO](https://github.com/pond3r/ggpo)). Transferable rule: replay must re-enter any tick from a snapshot, and GPU state is the hard part. TAA requires invalidation on any discontinuity or it ghosts ([TAA](https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/), [Filament](https://google.github.io/filament/Filament.html)); history epoch is a time concept, but the *policy* is renderer-owned.

### B3. What Tempus should own

**PROPOSAL.** One project-scoped `TimeState`: `playing`, signed `rate` (reverse), `offset`, `phase`, `loop {start, end, mode: loop|hold|pingpong}`, `workingRange`, optional `bpm`; `artisticTime` integrated on a fixed artistic tick with an accumulator so rate changes and reverse stay scrubbable.

Plus: read-only derived domains (`shaderTime`, `simulationTime`, `physicsTime`, `timelineTime`, `postTime`, `unscaledTime`) with **no direct `performance.now()` outside the clock**; per-domain `paused`; `epoch` counters with a `resetReason` enum for stateful resources; a capped fixed-step budget with "degrade, don't spiral"; and checkpoint descriptors that declare what *cannot* be captured so callers must reset it.

### B4. What Tempus must not own

- **The render loop** — it is called from `app.on('update')`, never drives frames.
- **Timeline data/evaluation** — keyframes, clips, group effects stay in `timeline.ts`; the panel is a transport client.
- **Simulation internals** — RD coefficients, iteration quality, physics solver settings are config; Tempus supplies step size and budget.
- **TAA jitter/accumulation/history format** — Tempus emits "invalidate with reason".
- **Quality/perf policy** — render scale and AA consume the clock, not the reverse.
- **Mutation lineage or archive** — time must not become a second history store.
- **Wall clock** — no `Date.now()`/`performance.now()` for artistic consumers.
- **UI** — no React; expose subscribe/getSnapshot like `timelineClock` already does.

### B5. Proposals — Tempus

| # | Proposal | Benefit | Cost | Risk | MVP |
|---|---|---|---|---|---|
| T1 | **One artistic clock; remove `animTime`**; no reset on rebuild — bump `epoch` | Kills re-phasing; one time for shaders, post, feedback | M | Wide mechanical consumer sweep | **CORE** |
| T2 | **Route post/feedback/dither through the clock** (`RendererPostEffect.ts:278`, `FeedbackOverlay.tsx:128`, `:1756`, `:4177`) | Four clocks → one; scrubbing affects the whole image | S | Feedback is a separate canvas | **CORE** |
| T3 | **Timeline delegates to Tempus**; delete singleton duration/loop | Removes duplicate state, 60 Hz emit, project-switch bleed | M | 6 call sites; preserve seek/loop/stop | **CORE** |
| T4 | **Fixed-step RD with accumulator + cap**; expose `steps`/`simTime` in diagnostics | Reproducible across frame rates — precondition for replay | M | Perf budget and a visible "slowing" state | **CORE** |
| T5 | **Explicit seek contract per domain**: backward ⇒ reset/restore, forward ⇒ capped fast-forward | Makes the scrub bar honest | M | Fast-forward cost | NEAR-TERM |
| T6 | **Checkpoints for RD + physics**; declared uncapturable for TAA/post | Record/replay, branch-from-time, fair mutation comparison | L | RGBA16F readback cost/compat | NEAR-TERM |
| T7 | **Generalize the token pattern** to `epoch` + `resetReason` | One mechanism, observable, consistent | S–M | Schema compatibility | NEAR-TERM |
| T8 | **Time params belong to the clock** (rate/offset/phase/loop/warp/reverse), modifiers keep local shape | One mutation moves the whole piece in time | L | Breaks existing param semantics; needs shim | EXPERIMENTAL |
| T9 | **Nested clocks with inheritance** + `independent` flag | Freeze one object while the scene plays | L | Needs a scope concept RE lacks | EXPERIMENTAL |
| T10 | **Replay envelope** `(projectHash, seed, t0, stepPolicy)` → reproducible frame N | Trustworthy mutation/checkpoint/regression tests | M after T1–T4/T6 | Hidden wall-clock reads break it | EXPERIMENTAL |

### B6. Mutation × time

**INFERENCE.** They fail together. `mutateTime` edits `speed` (`:126–133`) and `mutateValues` edits RD `feed`/`kill`, but the same seed produces a different pattern at 30 vs 60 fps. Recording a mutation without `t0` and step policy records a parameter edit but not the state it produced. **PROPOSAL:** a record captures `(ops, seed, baseHash, t0, stepPolicy)`; branching restores project *and* temporal state (T6) before claiming replay.

---

## Part C — MVP order

**CORE:** M1 seed control, M2 deterministic identity, M3 op-based archive (stops quota loss, makes lineage real); M4/M5 amount-vs-structure and local perturbation; T1 single artistic clock, T2 route post/feedback/dither, T3 timeline delegates; T4 fixed-step RD.

**NEAR-TERM:** M6 structural operators, M7 locks, M8 visual diff; T5 seek contract, T6 checkpoints, T7 epoch unification.

**EXPERIMENTAL:** M9 descriptor archive, M10 record rollback, M11 clock-based time mutation; T8 clock-owned time params, T9 nested clocks, T10 replay envelope.

**Do not build:** aesthetic fitness ranking or "best mutation"; a second history store for time; Tempus as render-loop owner.

## Part D — Open questions

1. Is mutation a **tool** (single step) or a **mode** (browse a family)? M1–M5 assume tool, M9 assumes mode; this decides whether the archive is session- or project-scoped.
2. Should `Project.mutation` be persisted at all? Recommended: no — lineage belongs to the workspace, removing the 13 MB risk by construction.
3. Is reverse playback required? If yes, RD and physics must be checkpoint-based, which is the largest cost driver in Part B.
4. Is a headless/export path planned (R16)? If so T3 is mandatory, not optional.

---

## Sources

- Karl Sims, *Genetic Images* — https://www.karlsims.com/genetic-images.html
- Karl Sims, *Evolved Virtual Creatures* — https://www.karlsims.com/evolved-virtual-creatures.html
- *Interactive evolutionary computation* — https://en.wikipedia.org/wiki/Interactive_evolutionary_computation
- Electric Sheep — https://electricsheep.org/
- Lehman & Stanley, *Abandoning Objectives* — https://direct.mit.edu/evco/article/19/2/189/1276/Abandoning-Objectives-Evolution-Through-the-Search
- Mouret & Clune, *MAP-Elites* — https://arxiv.org/abs/1504.04909
- *Quality-Diversity Optimization* — https://arxiv.org/abs/2012.04322
- Pugh, Soros & Stanley, *Quality Diversity* — https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2016.00040/full
- Glenn Fiedler, *Fix Your Timestep!* — https://gafferongames.com/post/fix_your_timestep/
- TouchDesigner, *Time COMP* — https://docs.derivative.ca/Time_COMP
- Unity, *Time and frame rate management* — https://docs.unity3d.com/Manual/TimeFrameManagement.html
- *1500 Archers* (deterministic lockstep) — https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond
- GGPO rollback networking — https://github.com/pond3r/ggpo
- *Temporal AA and the quest for the holy trail* — https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/
- Filament rendering documentation — https://google.github.io/filament/Filament.html
