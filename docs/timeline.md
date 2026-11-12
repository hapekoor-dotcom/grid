# Timeline and animation layers

## Evaluation order

1. Base scene value (object/light/material/project).
2. Timeline sampled value (keyframe tracks, then procedural clips for the same path).
3. Modifier Stack (motion/shader/clone) applied on top of the evaluated object root.
4. Renderer.

Timeline values are evaluated into a temporary effective project for the
renderer only. The project's base values are never overwritten by playback.
Removing a track/clip or seeking outside a clip restores the base values.

If a keyframe track and a clip target the same property, the clip wins because
clips are sampled after tracks. Multiple clips targeting the same path use the
last matching clip in timeline order.

## Data

`Project.timeline` stores duration, loop, tracks and clips.

Track:
```
{ id, objectId|null, propertyPath, keyframes[] }
```

Keyframe:
```
{ id, time, value, easing }
```

Supported easing: linear, easeIn, easeOut, easeInOut, step/hold.

Clip:
```
{ id, type, objectId|null, propertyPath, start, end, enabled, fadeIn, fadeOut, params }
```

Clip types: pulse, wave, rotate, noise.

## Controller

`TimelineClock` owns playhead time and play/pause state. It updates the renderer
through the PlayCanvas update loop, not React state. The Timeline panel advances
the clock and polls the display at a reduced rate.

## Commands

`src/lib/timelineCommands.ts` exposes structured operations for UI and future AI:

- setDuration / setLoop
- createTrack / createTrackWithKeyframe
- upsertKeyframe / updateKeyframe / removeKeyframe
- createClip / updateClip / removeClip
- createGroupWave / createColorFade
- setClipTiming

All command edits use the normal store mutation path, so Undo/Redo and project
serialization apply automatically. Drag edits start/end a transaction.
