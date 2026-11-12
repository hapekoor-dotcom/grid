# Effect modules

Effect modules are data-defined in `src/lib/modifiers.ts`. The Inspector and the
Timeline property picker are generated from each module's `fields`; adding a
module does not require a new React component.

Schema highlights:

```ts
{
  type, label, category,
  targets: ['model' | 'light' | 'device' | 'scene'],
  runtime: 'motion' | 'shader' | 'clone' | 'scene',
  stage: 'geometry' | 'surface' | 'temporal' | 'post' | 'simulation',
  cost: 'low' | 'medium' | 'high' | 'extreme',
  defaults,
  fields: [{ key, label, kind, min, max, unit, options, animatable, aiDescription }]
}
```

Runtime order is preserved on the object root:

```text
geometry shader (vertex chunk)
surface shader (StandardMaterial emissive/opacity chunks)
motion root modifiers
clone instances
scene post overlay / feedback
```

Shader modules patch the existing StandardMaterial chunks so PBR lighting,
shadows, fog and tone mapping remain intact.

Implemented geometry modules include Domain Warp, advanced Twist, Bend,
Attractor / Repulsor, Vortex, Taper / Pinch / Bulge, Shear / Quantize, texture
displacement with radial / RGB vector / normal / world modes, and clone arrays
(ring, linear, grid, spiral, helix, sphere).

Implemented surface modules include Liquid Chrome, Magma, Plasma, Advanced
Hologram, Iridescent Thin Film and Triplanar Noise Surface. Existing Fresnel and
Dissolve modules remain.

Implemented post modules are Feedback / Afterimage, RGB Split, Kaleidoscope,
Pixelate, Scanlines / VHS and UV Distortion. These run through the viewport
post overlay and are real animated screen output.

Light modules currently include Intensity Noise, Color Drift, Beam Pulse,
Light Orbit, Random Walk, Strobe Pattern and Volumetric Modulation. They write
into the existing PlayCanvas light components each frame.

The `+ Effect` picker is searchable and grouped by stage (DEFORM, MATERIAL,
LIGHT, POST, CLONE, MOTION, etc.). Recent effects are remembered locally.
Stack controls provide Bypass all, Solo, Randomize and Reset.

All object-shader parameters are available as Timeline modifier paths
(`modifier.<id>.<param>`), are Undoable, and persist in project JSON.

## Current boundaries

The current build provides a data-driven module/Inspector pipeline and advanced
shader pack. It does not yet ship the full Shader Lab source compiler, arbitrary
GLSL/WGSL modules, shared shader-instance targets, a general modulation graph,
field routing, scene/camera module runtime, particles, presets, or
reaction-diffusion simulation. Post effects currently run in the viewport screen
overlay rather than a CameraFrame compose pass.
