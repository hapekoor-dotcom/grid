# R05 — Temporal Systems

See `../04_TEMPORAL_SYSTEMS.md` and `R09_R10_mutation_time.md`.

FACT: clocks: animTime (reset on rebuild), timelineClock, post frame.time, RD time/dt, physics fixed step, TAA/post history.
FACT: RD uses iterations/frame with dt-scaled step, no accumulator → frame-rate dependent.
FACT: rebuild resets TAA and animTime but not RD/post.
FACT: post reset tokens per pass; TAA reset by toggling enabled+update.
FACT: project switch can retain RD/post/physics state.
PROPOSAL: Tempus canonical clock; fixed-step sim; epoch/reset reason; checkpoints; derived timeline.
