# Batch 18D — Popup Theme, Fixtures, and Validation Report

## Changes

- Added `PopupThemeTokens` for `backgroundColor`, `overlayColor`, `borderRadius`, and `animationDuration`; integrated them with theme defaults, merging, NativeWind v4/v5 variables, and duration serialization.
- Added ten canonical Popup fixtures and registered them in the v2 catalog. Added the Popup component documentation and token-explorer coverage.
- No separate Portal manager, React Root, global active Popup, v1 compatibility layer, animation runtime, or dependency was added. Existing Dialog, Portal, Tooltip, and Popover public behavior was not intentionally changed.

## Automated validation

- `pnpm run package:typecheck` — passed.
- `pnpm run package:fixtures:typecheck` — passed.
- `pnpm run package:consumer-fixtures:typecheck` — passed.
- `pnpm run consumers:typecheck` — passed for NativeWind v4 and v5 consumers. Node emitted a `DEP0190` deprecation warning.
- `pnpm run playground:typecheck` — passed.
- `pnpm run package:test:v2` — 25 suites and 215 tests passed.
- `pnpm run playground:test` — 10 suites and 35 tests passed. Jest emitted the existing Reanimated native warning; no test failed.
- `pnpm run fixtures:generate` — generated 69 fixtures; `pnpm run fixtures:check` — verified all 69.
- `pnpm run lint` — passed.
- `pnpm run build` — passed; Bob compiled 129 source files and copied 3 theme assets. It emitted the CommonJS `esm` / `exports.require` configuration warning.
- Focused Prettier check — passed across Popup source, tests, theme exports, fixtures, docs, and the four reports.
- `git diff --check` — passed after all implementation and report files were added.

## Android acceptance

- Used the Pixel 10 Android emulator, serial `emulator-5554`, with the Playground on Metro port `18761`.
- Opened center, top, bottom, left, and right Popups and confirmed their settled panel positions. Android Back closed each. The controlled example issued one close request; a mask press closed the dismissible example. The bottom safe-area and long-scroll examples worked.
- Opened bottom and center forms with LatinIME visible. All three inputs remained in the available panel area above the keyboard. Back dismissed the keyboard before the next Back closed the Popup.
- Switched the Playground to dark mode and checked both the dark default Popup surface and the scoped `ConfigProvider` theme override. Returned the Playground to System appearance afterward.
- Closed the agent-device session with no active Popup entry in the final snapshot. Restored the emulator's original agent-device input method and `show_ime_with_hard_keyboard=0` setting; the emulator was left running.
- Directional mapping is asserted by the automated Popup tests and the settled positions were visually checked. A screen recording was captured but not reviewed frame by frame; transient flicker and frame-level animation performance were not independently measured.

## Remaining scope and Git state

- iOS, HarmonyOS, and TalkBack remain deferred. Android checks did not include landscape rotation, safe-area plus keyboard simultaneously, or on-device Popup + Dialog / Portal interactions; those combinations have automated coverage where applicable.
- All changes remain uncommitted and unpushed. The pre-existing dirty Batch 16B–17 worktree changes and the starting `.changeset` file were preserved.
- **Batch 18 — Popup Completed (Android Scope).**
