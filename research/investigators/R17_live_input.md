# R17 — External / Live Input

Status: external research + inference; no implementation.

## Current input surface (FACT)

Signals are project data evaluate `time, object`; they can drive modifier/shader/RD parameters. There is no audio, MIDI, OSC, DMX, webcam, microphone, sensor, gamepad or network input path in the runtime. DMX exists as a planning/patch model, not as live Art-Net output.

## Audio

- WebAudio `AnalyserNode` FFT/byte frequency data.
- Features: bands, spectral centroid, RMS/energy, onset, tempo/BPM.
- Latency/security: microphone permission, user gesture, tab throttling.
- Best RE use: inject into RD, advect a field, modulate simulation parameters, drive post feedback. Avoid direct audio→scale clichés.
- MVP: EXPERIMENTAL; audio→field near-term.

## MIDI

- Web MIDI API; CC/note mapping; device permissions.
- Best: map to named parameters/signals, not a second modulation system.
- MVP: NEAR-TERM for installation/performance.

## OSC / network

- WebSocket bridge/OSC-to-WS; no native UDP in browser.
- Best: external control of seed/mutation/clock/parameters.
- MVP: LATER/installation-specific.

## DMX / Art-Net

- Browser can receive via WebSocket bridge; direct UDP not available.
- Best: drive light/field parameters from a console.
- MVP: only if RE:GRID or installation product.

## Webcam / motion / sensors

- MediaPipe/pose/optical flow; privacy/permission cost.
- Best: field masks/attractors/injection.
- MVP: EXPERIMENTAL.

## Recommended abstraction

Input should produce **signals** with metadata:

```text
InputSource { id, kind, value(s), confidence, timestamp, domain }
```

Do not create separate audio/MIDI/OSC parameter systems. Feed Tempus/signals/fields. Record input events if exact replay is promised.

## Risks

- Permissions/user gesture.
- Variable latency and frame alignment.
- Non-deterministic replay.
- Browser background throttling.
- Security/privacy for camera/mic.
- DMX/OSC bridge fragility.

## MVP classification

CORE: none.
NEAR-TERM: MIDI + audio FFT → field/parameters.
EXPERIMENTAL: webcam/pose/OSC.
LATER: Art-Net/DMX live output.
