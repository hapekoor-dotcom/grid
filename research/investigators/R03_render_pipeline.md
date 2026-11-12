# R03 — Render Pipeline

See `../03_RENDER_PIPELINE.md`.

FACT: PlayCanvas CameraFrame scene → TAA → custom post resolve → bloom/fog/color → ACES → dither/compose → backbuffer.
FACT: post intermediates pinned linear RGBA16F; one history target per pass; copy pass; passthrough identity test passes 0%/max3.
FACT: failed post pass is dropped from `built` but stack index still used by frameUpdate/resolveScene.
FACT: runtime destroy lacks explicit post/RD destruction.
FACT: RD is raw WebGL2 on PlayCanvas device, not CameraFrame.
PROPOSAL: built-pass-entry mapping, explicit destroy, resource inventory, numeric HDR identity.
