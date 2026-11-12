# Portable RE:MORPH projects

`.remorph` is a ZIP archive produced with `fflate` (small, dependency-free, browser-native
zip/unzip; chosen instead of a framework). It contains:

- `manifest.json` — format/version, full scene JSON, asset descriptors
- `assets/<asset-id>/<original-name>` — all imported model payloads referenced by the scene

Asset references in the manifest are relative paths inside the archive. No blob URLs,
absolute local paths, or IndexedDB keys are used as the only asset source.

External-resource GLTF imports are normalized at import time: external buffers and images
are embedded as data URIs in a self-contained GLTF JSON payload. That payload is what the
package carries, so the attached BIN and texture files travel with the project without
depending on the original filesystem layout.

On import the archive is validated, each asset is restored into IndexedDB under its original
ID, and the scene is parsed through the normal project migration/validation path.
