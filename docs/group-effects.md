# Shared group effects

A group effect is one parameter source with many target objects.

```ts
project.timeline.groupEffects = [{
  id: 'eff_...',
  type: 'groupWave',
  enabled: true,
  targetIds: ['bar-1', 'bar-2', ...],
  propertyPath: 'light.intensity',
  start: 2,
  end: 10,
  fadeIn: 0.3,
  fadeOut: 0.3,
  params: {
    frequency: 1,
    phaseSpread: 360,
    phaseMode: 'left-right',
    min: 0.2,
    max: 1,
    waveform: 'sine',
    colorFrom: '#2f7bff',
    colorTo: '#ff2fd0'
  }
}]
```

The group effect appears as one timeline clip. It is sampled once and writes the
same property to every target, deriving per-target phase from target order:

```text
phase = basePhase + index * phaseSpread / targetCount
```

Timeline sampling applies shared effects after ordinary tracks/clips. The
existing effective-project runtime applies the resulting overrides to all
targets.

## Commands

`src/lib/timelineCommands.ts`:

- `createGroupWave(options)` → one effect id
- `updateEffect(effectId, { frequency })`
- `updateGroupEffect(effectId, patch)`
- `removeGroupEffect(effectId)`
- `addGroupEffectTargets(effectId, ids)`
- `removeGroupEffectTargets(effectId, ids)`
- `setGroupEffectTargets(effectId, ids)`
- `detachGroupEffectTargets(effectId, ids)` → new independent effect id
- `setGroupEffectTiming(effectId, start, end)`

All commands use the shared project-mutation path, so an edit is one Undo step
and the group survives save/reload.
