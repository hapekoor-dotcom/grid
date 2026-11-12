# Product Identity — What Is RE?

## The repository contains two identities

FACT: `README.md` and `source/PRODUCT.md` describe **RE:GRID**, an offline event-lighting planning prototype: fixtures, DMX, power, cable routing, stage layout, 3D preview. The current `package.json` description says “professional environment for scene planning, light and connections.”

FACT: the current development work adds an experimental visual system: GPU Reaction Diffusion, fields, modifiers, graph routing, mutation, shader/post feedback, marquee picking. The user language calls it **RE:MORPH**: “make the rules, lose control, keep what emerges.”

FACT: the UI brand still says RE:GRID. The plan editor, DMX patch, power, equipment catalog and rig tests are still present. The 3D runtime is a separate PlayCanvas implementation from the legacy stage preview.

This identity collision is the largest product debt in the repository. A senior architect must decide which product owns the codebase.

## If RE is RE:GRID

The core loop is:

```text
plan physical rig → connect power/DMX → inspect patch/power → preview light
```

Strengths: real domain model, equipment catalog, cable/routing tests, DMX/power diagnostics.
Weaknesses: the new visual engine is irrelevant; RD/mutation/graph/Shader Lab are scope creep; the legacy Three.js preview and PlayCanvas runtime duplicate.

## If RE is RE:MORPH

The core loop is:

```text
seed conditions → evolve → observe → mutate → keep/branch → capture
```

Strengths: RD + fields + modifier stack + mutation + shader/post feedback already form a coherent experimental instrument; GPU-native field routing; strong visual immediacy.
Weaknesses: the scene is still a stage/rig editor; object/light/DMX concepts dominate; plan editor and catalog add noise; persistence and time are not designed for organisms; graph/field abstractions are partial.

## Recommended identity

RE should be **a self-organizing visual instrument**, not a conventional 3D editor and not a lighting-planning tool.

The fundamental loop:

```text
SEED → CONDITIONS → EVOLUTION → OBSERVATION → MUTATION → KEEP/BRANCH → CAPTURE
```

The stage/rig domain may survive as:

- a **scene/prop source** (objects, lights, stage geometry);
- a **preset/world** for installations;
- an optional advanced planning mode.

It should not remain the product's primary information architecture unless the team explicitly chooses RE:GRID.

## What the current interface fails to communicate

- Why objects deform (RDM/fields) is hidden in modifiers.
- Why an object is selectable is hidden in effective bounds.
- Why a post pass changes the image is hidden in shaders/format/history.
- Mutation is a small bar, not the central loop.
- Time is scattered; there is no “organism clock.”
- The plan editor communicates “planning,” not “cultivation.”
- The graph is an advanced panel, not a visible condition system.
- The name and documentation say another product.

## Brand / terminology recommendation

Choose one:

A. **RE:GRID** — commit to stage planning; remove/relegate morphogenesis features.
B. **RE:MORPH** — commit to the organism instrument; relegate stage planning to an importable scene/world preset.
C. **RE** — umbrella with two explicit modes, shared scene model, separate MVP surfaces.

Do not keep the current implicit C. It creates feature accumulation without a coherent product.

## Identity test

For the next feature, ask:

> Does this help the user create, steer, observe, mutate or preserve an evolving visual system?

If not, it belongs to the other product.
