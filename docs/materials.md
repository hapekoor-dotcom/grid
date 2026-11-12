# Material texture maps

Texture data is stored in the browser asset store (IndexedDB), never embedded in
project JSON or `materialOverrides`.

## Data

Each object stores overrides per material slot:

```ts
object.materialOverrides[slot].maps[mapKind] = {
  assetId,        // uploaded image asset id; null means use the imported GLB texture
  uv,             // UV channel 0..7
  tiling, offset, // { x, y }
  rotation,       // degrees
  channel,        // r/g/b/a/rgb where supported
  invert,         // roughness/gloss map inversion
  intensity       // emissive map strength
}
```

Supported map kinds: `baseColor`, `metalness`, `roughness`, `normal`, `emissive`,
`opacity`, `ao`.

The imported GLB material remains untouched. The runtime clones the slot material
per object instance, applies the overrides and calls `material.update()`.

## Commands

`src/lib/materialCommands.ts` exposes the AI-ready command layer:

- `setMap(objectId, slot, kind, layer)`
- `removeMap(...)`
- `resetToOriginal(...)`
- `setTransform(...)`
- `setChannel(...)`
- `setIntensity(...)`
- `tileMap(objectId, slot, kind, x, y)`
- `setUv(...)`
- `setDisplacementTexture(objectId, modifierId, imageUrl)` for the existing displacement modifier

All commands write through the normal project mutation path and are Undo/Redo
and persistence aware.

## Portable projects

`.remorph` archives include every texture asset referenced by material map
overrides. Plain project JSON keeps only the asset id references.
