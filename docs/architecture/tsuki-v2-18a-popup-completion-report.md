# Batch 18A — Popup API and Layout Report

## Changes

- Added the public composite `Popup` and its exported position, props, and styling types. The contract covers controlled and uncontrolled visibility, five positions, mask behavior, Android Back, modal accessibility, keyboard avoidance, bottom safe area, and semantic style slots.
- The component uses the existing Root `OverlayPortal` and transition presets. Host dimensions come from layout measurement. Center content keeps its natural size within host bounds; edge panels fill the available axis and remain constrained to the host.
- `className` and `style` target the full-screen content root. `classNames` and `styles` target `root`, `mask`, `wrapper`, and `container`. The composite API intentionally does not inherit all `ViewProps` or forward a ref to an ambiguous internal view.

## Validation and Android acceptance

- `pnpm run package:typecheck` passed.
- `pnpm run package:test:v2` passed: 25 suites and 215 tests.
- `pnpm run build` passed: 129 source files compiled and 3 theme assets copied.
- On the Pixel 10 emulator (`emulator-5554`, Metro port `18761`), the center, top, bottom, left, and right examples rendered in their corresponding host positions. The automated Popup tests assert the directional transition preset mapping; left uses the preset that enters from the left and right uses the preset that enters from the right.

## Remaining scope

- iOS, HarmonyOS, and TalkBack remain untested as planned. The Android transition recording was not reviewed frame by frame, so transient animation flicker was not independently assessed. See the consolidated [Batch 18D validation report](tsuki-v2-18d-popup-validation-report.md).
