# Batch 16C.2 — Named PortalHost Completion Report

## Delivered

- `Portal` now accepts `host`, defaulting to the reserved root target.
- Public `PortalHost` registers a named local React Native View target. Its default bounds fill its parent; callers can supply `style` for a smaller target.
- Named targets are stored in the current Root Registry in a map independent from the single OverlayHost registration. Duplicate live names in one Root and the reserved `root` name throw; separate Roots may reuse a name.
- Entries remain in the Registry when their target is unavailable. Unmounting a Host pauses rendering; remounting restores its entries. Changing `host` moves the stable Portal entry to the new target.
- Portal docs and canonical fixture now cover named targets, pending content, Host lifecycle, dynamic movement and theme bridging.

## Verification

- `pnpm run package:typecheck` — passed.
- `pnpm run package:fixtures:typecheck` — passed.
- Focused Portal and Overlay tests — 31 tests passed across 2 suites.
- `pnpm run fixtures:generate` — generated 65 catalog entries.
- `pnpm run fixtures:check` — passed.
- `git diff --check` — passed.

## Device scope

No device check was run in this batch. Local clipping, pointer hit testing, Android zIndex/elevation and native Window boundaries remain for the final Android acceptance.

## Git state

All changes remain uncommitted. The pre-existing Batch 16B worktree changes were kept in place.

## Next dependency

Batch 16C.3 can build on the target-local Host View and Registry entry order. Floating geometry and anchor measurement remain private.
