# Batch 18B — Popup State and Lifecycle Report

## Changes

- `visible` selects controlled mode; omitting it selects internal state initialized from `defaultVisible`. A close request calls `onVisibleChange(false)` once and leaves controlled state with its owner.
- Mask press invokes `onPressOverlay` before a close request. `overlay={false}` omits the mask and its touch blocker. Android Back is handled by the existing Root Registry and only targets the top overlay.
- Popup content mounts on first show, stays mounted through exit, and unmounts after the configured transition channels complete. Reopening during exit uses the existing generation-aware runtime; no timeout-based lifecycle or content cache was added.
- `modal` controls accessibility isolation independently of the mask. No imperative service or `onOpened` / `onClosed` callbacks were added.

## Validation and Android acceptance

- The full `pnpm run package:test:v2` suite passed: 25 suites and 215 tests, including Popup controlled/uncontrolled behavior, mask callbacks, Back routing, repeated Back while exiting, controlled refusal, overlay stacking, reopening during exit, StrictMode, Root unmount, and accessibility coverage.
- On Pixel 10 (`emulator-5554`), a controlled Back request incremented once and removed the Popup when its owner accepted. A dismissible mask press incremented its counter and closed the Popup. Repeated position open/Back flows returned to the fixture screen, and the final interactive snapshot had no active Popup layer.
- Popup + Dialog and Popup + Portal interactions are covered by automated tests; those nested combinations were not part of the final device run.

## Remaining scope

- iOS, HarmonyOS, and TalkBack remain untested as planned. The Android run checked settled UI states rather than reviewing every transition frame. See the [Batch 18D validation report](tsuki-v2-18d-popup-validation-report.md).
