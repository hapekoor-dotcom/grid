# Signal engine

Signals are first-class project data (`project.signals`). A signal has a stable
id, name, kind, enabled flag and serializable parameters. Signals are evaluated
once and can feed any number of parameter modulation sockets.

Supported generators: sine, triangle, saw, pulse, noise, FBM, random walk,
sample & hold, object distance, object direction, world position, normal
direction, fresnel/view angle, timeline and time.

Numeric effect parameters can carry a `ParameterModulator`:

```ts
modifier.modulators.distortion = {
  sourceId: 'sig_...',
  amount: 0.5,
  offset: 0,
  enabled: true
};
```

The base parameter remains untouched. `modulatedParams()` resolves
`base + offset + signalValue * amount`, clamped by the field schema. The same
signal can feed object geometry, surface shaders, lights, scene effects and post
effects.

# Shared effect stacks

`project.effectGroups` stores shared stacks:

```ts
{
  id, name, enabled,
  targetIds: ['obj-a', 'obj-b'],
  modifiers: [ ...normal SceneModifier modules ]
}
```

Multiple selected objects can create one shared stack from the Multi Inspector.
Editing any parameter updates every target. `Make unique` copies the stack into
the selected objects and removes those targets from the shared group.

# Presets and AI

`effectCommands` provides id-based operations for tools:

- `addSignal(kind)`
- `updateSignal(id, patch)`
- `removeSignal(id)`
- `bindModulator(target, modifierId, param, signalId, amount, offset)`
- `unbindModulator(...)`
- `setEffectParam(...)`
- `createSharedStack(targetIds, name)`
- `addEffectToStack(groupId, type)`
- `applyPreset(targetIds, presetId)`

Presets in `effectPresets.ts` are ordinary stacks of modules.

# Current boundaries

Signal evaluation and modulation are implemented for object motion/shader
effects, light effects, object clone stacks and scene post effects. Shared stack
runtime covers geometry, surface, motion, clone and light modules. Scene effects
include exposure, ambient drift and fog. Camera effects currently include FOV
pulse only; the camera-transform stack is not complete.
