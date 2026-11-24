# Batch 17A — Declarative Dialog Completion Report

## Delivered

- Added the public v2 `Dialog` component and its prop, action, theme, class-name, style, and options types to the package root exports.
- Implemented controlled and uncontrolled visibility, configurable mask dismissal, Android Back handling, default confirm/cancel actions, custom body and footer content, and viewport-limited body scrolling with the title and footer kept in place.
- Added asynchronous `beforeClose` handling. Confirm/cancel callbacks run before the guard; a false result or rejected guard keeps the Dialog open. Pending actions prevent duplicate submissions, and visibility changes invalidate stale results.
- Added default and round-button presentations, semantic action colors, accessibility on the modal panel, and independently configured mask and content transitions through the Root Overlay controller.
- Added Dialog theme tokens for `TsukiProvider` and `ConfigProvider`, plus NativeWind v4/v5 token output.
- Added canonical Playground examples and [Dialog v2 documentation](../components/v2/dialog/index.md).
- No v1 compatibility layer was added; the implementation follows the requested v2 API direction.

## Verification

- `pnpm run package:typecheck` — passed.
- Dialog regression coverage in `pnpm run package:test:v2` — passed as part of 24 suites and 198 tests.
- `pnpm run package:fixtures:typecheck` and `pnpm run playground:typecheck` — passed.
- `pnpm run fixtures:generate` — generated 68 component fixtures; `pnpm run fixtures:check` verified all 68.
- `pnpm run lint` — passed.
- `pnpm run build` — passed; Bob compiled 123 source files and copied 3 theme assets. Bob emitted its CommonJS `esm` / `exports.require` configuration warning.
- Focused Prettier check — passed.

## Scope

Dialog shares the Root-owned Overlay lifecycle and Theme resolution; it does not create a separate global modal host. Device acceptance and remaining platform coverage are recorded in the [Batch 17C validation report](tsuki-v2-17c-dialog-validation-report.md). Changes remain uncommitted.
