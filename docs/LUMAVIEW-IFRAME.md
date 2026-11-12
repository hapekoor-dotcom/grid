# lumaview iframe

The 3D viewport is now **lumaview**, a browser stage visualiser driven by Art-Net. We do not render beams ourselves.

- Viewer: `http://127.0.0.1:8765/?kiosk=1`
- Override: `VITE_LUMAVIEW_URL`
- Scene generated from `src/data/base-project.json`: `examples/riggrid.json`
- 4 Focus Flex → `GenericMovingHead`, 24 UBL12H → `RigGridBar` (6 RGB cells)
- Room/stage/backdrop/walls are OBJ meshes in lumaview's mesh store
- A local Python sender feeds a static DMX snapshot for the current light state; no real console/DMX hardware is involved.
- lumaview must be started separately:

```sh
cd /tmp/lumaview
./venv/bin/python lumaview.py examples/riggrid.json \
  --no-browser --no-video --port 8765 --meshes /tmp/lumaview/meshes
./venv/bin/python tools/riggrid_sender.py
```

The production server CSP allows `frame-src` only for the configured lumaview port.

## Not yet

- Scene regeneration on every 2D edit (currently generated once for the supplied base project).
- Exact fixture profiles and horizontal bar geometry.
- Dynamic DMX bridge; the current sender is static.
