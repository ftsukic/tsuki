# Batch 18C — Popup Safe Area and Keyboard Report

## Changes

- Bottom safe-area spacing is captured from the Popup declaration scope and rendered inside the panel so its background continues through the inset. It is disabled by default and omitted for other positions.
- Keyboard avoidance uses React Native keyboard events and measured host geometry without adding a package dependency. On Android, the available local host frame prevents double-applying `adjustResize`; the bottom inset spacer is suppressed while the keyboard is visible. iOS uses `KeyboardAvoidingView`.
- Popup content remains vertically scrollable within the measured host constraints.

## Validation and Android acceptance

- `pnpm run package:typecheck`, `pnpm run package:fixtures:typecheck`, and the full `pnpm run package:test:v2` suite passed. Tests cover safe-area spacing and keyboard overlap calculations.
- On Pixel 10 (`emulator-5554`), the bottom panel extended its background through the navigation-area inset. The long-content example scrolled through row 28. Bottom and centered multi-input forms remained visible above LatinIME; Back hid the keyboard first and closed the Popup on the next press. The original emulator input method and hardware-keyboard setting were restored after acceptance.
- Android measurements showed `measureInWindow` reporting a root origin one viewport below the display while the keyboard was open. Popup now uses its root-local `onLayout` frame for keyboard geometry.

## Remaining scope

- iOS keyboard behavior, landscape and changing insets, safe area combined with an open keyboard, and TalkBack were not device-verified. Those remain outside the Android-only acceptance scope in this batch.
