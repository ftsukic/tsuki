# Batch 17C — Dialog Validation Report

## Automated checks

- `pnpm run package:typecheck` — passed.
- `pnpm run package:fixtures:typecheck`, `pnpm run package:consumer-fixtures:typecheck`, and `pnpm run playground:typecheck` — passed.
- `pnpm dlx @expo/agent-cli@latest typecheck` from `apps/playground-nw4` and `apps/playground-nw5` — both passed.
- `pnpm run package:test:v2` — 24 suites and 198 tests passed.
- `pnpm run playground:test` — 10 suites and 35 tests passed. Jest logged a Reanimated warning during the Playground test run; it did not fail a test.
- `pnpm run fixtures:generate` generated 68 component fixtures; `pnpm run fixtures:check` verified all 68.
- `pnpm run lint` — passed.
- `pnpm run build` — passed; Bob compiled 123 source files and copied 3 theme assets. It emitted the CommonJS `esm` / `exports.require` configuration warning.
- Focused Prettier check — passed.
- `pnpm changeset status` — passed; the aggregate pending release reports a major bump because the worktree already contains the tracked `bright-trees-begin.md` major changeset. The Dialog changeset itself is minor.
- `pnpm run release:check-package` was blocked because `npm` is absent from PATH. `pnpm pack --dry-run --json --ignore-scripts` passed; the package file list included Dialog JavaScript and declarations.

## Android acceptance

- Used the Pixel 10 Android emulator, serial `emulator-5554`, running the Playground development client on Metro port `18761`.
- Opened the basic prompt and confirm/cancel prompt; each action dismissed the Dialog.
- Verified that a mask press does not dismiss the controlled Dialog by default, then Android Back dismissed it.
- Confirmed that an async `beforeClose` can complete and close the prompt. The brief loading state was covered by automated tests but was not captured in a device screenshot.
- Opened the custom content fixture, scrolled its long body to the final paragraph, and confirmed the title and `Done` footer stayed visible.
- Opened round-button and ConfigProvider-themed prompts. Switched to dark mode and confirmed the default action label remained readable against the dark panel.
- Opened and settled imperative service prompts, including prompts from two distinct service instances in sequence.

Selected screenshots: [long body scrolled](evidence/tsuki-v2-17-dialog-android-long-body-scrolled.png), [round buttons](evidence/tsuki-v2-17-dialog-android-round.png), [themed dialog](evidence/tsuki-v2-17-dialog-android-theme.png), [dark mode after the contrast fix](evidence/tsuki-v2-17-dialog-dark-verified.png), and [service dialog](evidence/tsuki-v2-17-dialog-android-service.png).

## Remaining scope and Git state

- iOS, HarmonyOS, TalkBack, and keyboard behavior were not verified. Multiple Root isolation is covered by automated tests, not by this single-Root device session.
- All changes remain uncommitted. Existing dirty Batch 16B/16C files and other starting worktree changes were preserved.
