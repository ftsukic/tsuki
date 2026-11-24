# Batch 16C.1 — Portal Completion Report

## Delivered

- Added public `Portal` and a Portal-specific Root Registry collection, ID sequence, subscription and shared mount ordering.
- Portal mounts arbitrary React content, updates its entry in place, removes the entry on owner unmount and survives StrictMode effect replay without duplicate ownership.
- Portal content receives its captured Tsuki theme scope. Application Context values remain caller-owned and are not implicitly bridged.
- The normal Portal path has no mask, transition, Back dismissal or modal accessibility isolation. Root isolation and the existing unique OverlayHost contract remain intact.
- Added focused Portal lifecycle, updates, ordering, Theme, StrictMode and Root-isolation tests.

## Verification

- `pnpm run package:typecheck` — passed.
- Focused Portal and Overlay tests — 28 tests passed across 2 suites.
- Portal fixture generation and catalog check — passed.
- `git diff --check` — passed.

## Device scope

No device check was run in this batch. Android rendering, touch pass-through and local Host geometry are part of the final Batch 16C acceptance.

## Git state

All changes remain uncommitted. The pre-existing Batch 16B worktree changes were preserved.

## Next dependency

Batch 16C.2 can add named targets without changing the default Root Host lifecycle.
