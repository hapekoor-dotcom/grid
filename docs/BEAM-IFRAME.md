# Beam iframe viewport

The active 3D viewport is **Beatline Beam** embedded as an iframe. The PlayCanvas adapter remains in the repository as a fallback/experiment, but it is no longer mounted by `AppShell`.

## Runtime

- Default URL: `http://127.0.0.1:5181/?kiosk=1`
- Override: `VITE_BEAM_URL=http://host:port/?kiosk=1 npm run build`
- The kiosk entry loads `demo/showfiles/stage3.showfile.json`, hides Beam's editor chrome and puts the visualizer in full-window mode.
- The current kiosk show is the user's `STAGE 3_export.beam` export, copied as a plain showfile.

## Start Beam

Beam is GPL-3.0. The prepared clone lives at `/tmp/beam`:

```sh
cd /tmp/beam
cp "/path/to/STAGE 3_export.beam" /tmp/stage.beam
mkdir -p /tmp/stage && unzip -o /tmp/stage.beam -d /tmp/stage
cp /tmp/stage/show.json public/demo/showfiles/stage3.showfile.json
npm run build
python3 -m http.server 5181 --bind 127.0.0.1 --directory dist
```

The production server CSP allows `frame-src` for `127.0.0.1:5181` and `localhost:5181`.

## Limits

- Beam is a separate runtime and is not synchronised with `Project.objects`; the iframe currently shows the Beam stage export, not the Rig Grid JSON layout.
- `app/src/components/view3d/PlayCanvasViewport.tsx` and `playcanvasRuntime.ts` are kept for reference and for the legacy tests, but no longer appear in the app.
