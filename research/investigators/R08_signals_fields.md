# R08 — Signals / Fields

See `../07_SIGNAL_FIELD_MODEL.md`.

FACT: `ParameterModulator` supports signal/modifier/reaction scalar; `FieldLink` is separate; post modulation only signals.
FACT: `modulatedParams` recursively evaluates sources with stack/cache; graph order/cycle utilities exist; not a single compiled graph.
FACT: adapters exist value/field; field adapters shader-side; automatic surface consumers implicit.
FACT: RD scalar readback vs shader `.r` mismatch.
PROPOSAL: one typed connection schema with stable IDs, value/field split, compiled topology, explicit generated edges.
