# Batch 17B — Dialog Service Completion Report

## Delivered

- Added public `createDialogService()` and `DialogServiceBridge` exports.
- Each service tracks its own active request. The bridge binds it to the nearest `TsukiProvider` Root, Overlay controller, Registry, and Theme scope; no process-wide active Dialog state was added.
- `showDialog()` resolves to `'confirm'` when confirmed and `undefined` when dismissed, replaced, or when its Root is destroyed. `showConfirmDialog()` rejects with `'cancel'` on cancel, resolves to `'confirm'` on confirmation, and resolves to `undefined` on other dismissal paths.
- A new request replaces the previous request for the same service while the previous Overlay completes its exit. Distinct services keep independent active requests. Calls without a mounted bridge fail synchronously; a service cannot be bound to two active Roots at once.
- Service requests use the same Dialog content, actions, theme, async `beforeClose`, accessibility, and transitions as the declarative component.

## Verification

- `pnpm run package:typecheck` — passed.
- `dialog-service.test.tsx` coverage passed in `pnpm run package:test:v2`; the complete v2 run passed 24 suites and 198 tests.
- `pnpm run package:consumer-fixtures:typecheck` — passed.
- `pnpm run build` — passed; the package build included the service exports and type declarations.
- `pnpm pack --dry-run --json --ignore-scripts` — passed and confirmed that Dialog JavaScript and TypeScript declarations are included in the package file list.
- The repository `pnpm run release:check-package` command could not run because this environment has no `npm` executable on PATH. The pnpm dry-run pack check above was used to inspect the package output; nothing was published.

## Scope

Automated tests cover service request settlement, replacement, Root binding and cleanup, including React Strict Mode lifecycle behavior. Android service interaction is recorded in the [Batch 17C validation report](tsuki-v2-17c-dialog-validation-report.md). Changes remain uncommitted.
