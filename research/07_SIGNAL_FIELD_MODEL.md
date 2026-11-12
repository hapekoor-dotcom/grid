# 07 — Signal / Field / Simulation / Mutation Model

## Current model

FACT: A parameter can be driven by `ParameterModulator`:

```ts
{
  sourceType?: 'signal' | 'modifier' | 'reaction';
  sourceId: string;
  output?: string;
  adapter?: {kind, params};
  amount, offset, enabled
}
```

- Signals are periodic/random scalar sources in `signals.ts`.
- Modifier outputs are CPU scalar outputs from `modifierOutputs.ts`.
- Reaction scalar uses cached 3×3 GPU readback (`sampleReactionOutput`).
- GPU field links are a separate `Project.fieldLinks` model, not `ParameterModulator`.
- Graph UI edits modulators/field links; execution is recursive `modulatedParams`.
- `graphRouting.ts` has typed port primitives, adapters, cycle detection, ordering, but the runtime does not use a compiled port graph for all connections.

## The fundamental problem

There are **three parallel concepts**:

1. **Value** — a number/vector/color.
2. **Signal** — a time-varying value.
3. **Field** — spatial data with texture/GPU representation.

The current UI presents them as sources in one socket, but the execution paths differ:

- value/signal/modifier scalar → CPU modulation before uniforms;
- RD scalar → synchronous readback;
- RD field → GPU texture sampled inside shader;
- Post shader → own uniform evaluation, only signals (no RD/modifier routing in post `frameUpdate`).

This is coherent at the rendering level but not at the model level. The user sees “RD · scalar sample” next to modifier outputs, while spatial outputs are hidden in RD-specific modifier paths.

## Recommended conceptual model

```text
SOURCE
  Value
  Time (Tempus)
  Entropy
  Relation
  Field
  Simulation
  Mutation

PORT TYPE
  float, vec2, vec3, color
  texture2D, scalarField, vectorField, normalField, maskField

ADAPTER
  value adapters
  field adapters (GPU)
  type adapters

CONSUMER
  parameter / material slot / light / post uniform / simulation parameter
```

### Value vs field must stay separate

A float is not a field. A field is not a CPU float. The UI should not show field outputs in float sockets without an explicit adapter. The current separation is directionally correct but incomplete.

### Signal vs field UX

Recommendation: keep user-facing sources compact:

- Time
- Entropy
- Relation
- Field
- Simulation

Internally map “Time” to oscillator/noise/sample-and-hold; map “Entropy” to noise family; map “Relation” to object/attractor outputs. Do not expose a generator catalog in normal mode.

### Provenance

Every connection should carry a stable ID, source node/port, adapter chain, destination node/port, execution domain and owner (object/Look/scene/post). The UI must be able to answer “why is this changing?” without reading React state.

## Current gaps

- No single node/port/connection graph; modulators + field links + post values are separate.
- No compiled topology for all consumers; post modulation bypasses recursive modifier outputs.
- `FieldLink` targets a modifier ID, ambiguous under Shared Look clones (partly patched by ID cloning).
- Post shader modulators only support signals, not RD/modifier outputs.
- `modulatedParams` source recursion is deterministic but not a compiled graph; cycle guard is runtime stack, not a single authority.
- Mutation engine writes modulators directly, not a graph diff model.

## Proposal

Define one `GraphPort`/`GraphConnection` schema used by inline sockets, advanced graph, runtime, serialization and mutation. Keep a **compiled execution plan** cached by topology generation. Separate value and field planes. Make every automatic routing explicit as a generated connection with a stable ID.

## MVP classification

CORE: one typed connection model; explicit value/field split; stable IDs.
NEAR-TERM: compiled graph plan; post consumers; field adapters.
EXPERIMENTAL: arbitrary graph topology mutation.
REJECT: a giant always-visible node graph as the only UX.
