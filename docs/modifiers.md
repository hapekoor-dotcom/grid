# Modifier Stack

## Data model

`SceneObject.modifiers` contains ordered `SceneModifier` records:

```ts
{ id, type, enabled, params }
```

`Project.effects` uses the same records for scene-level effects such as Feedback.

All parameters live in `params`; there is no UI-only effect state. Object IDs and
modifier IDs are stable and serialized. Missing parameters fall back to the
registry defaults at runtime and in the editor.

## Registry

`src/lib/modifiers.ts` is the single modifier registry. Each definition declares:

- `type`, `label`, `category`
- target object kinds (`model`, `light`, `device`, `scene`)
- default parameters
- parameter field metadata (`kind`, min/max/step/unit/options/overdrive)

The UI (`ModifiersEditor`) renders controls directly from that metadata.

## Runtime dispatch

- Motion and clone modifiers are applied in the PlayCanvas runtime
  (`applyModifiers`, `applyRadialTransforms`).
- Shader modifiers are applied through `modifierShader.ts` GLSL chunks:
  - vertex deformation: Twist, Noise Displace, Texture Displace
  - surface: Fresnel / Iridescence, Dissolve
  - uniforms are bound per mesh instance and refreshed every frame
- Radial Clone reuses cloned entities and shared geometry/materials.
- Feedback is a scene-level view effect rendered by `FeedbackOverlay` from the
  same serialized config.

## Adding a modifier

1. Add a definition to `MODIFIER_DEFINITIONS` with its target, category,
   defaults and field metadata.
2. Implement runtime behavior in the matching runtime path:
   - motion: `applyModifiers`
   - structure/clone: `syncRadialClones` / `applyRadialTransforms`
   - shader deformation/surface: add uniforms and GLSL in `modifierShader.ts`
     and bind them in `applyShaderUniforms`
   - scene effect: implement in the view effect layer and read params from
     `Project.effects`
3. Add the type to the relevant target gate in the runtime if it needs a custom
   branch.
4. No migration is needed for new optional fields; defaults fill missing values.
