# Batch 16C.3 — Floating Runtime Completion Report

## Delivered

- Added private placement, collision, geometry, native measurement and `useFloating` modules.
- Supported all twelve top/bottom/left/right placements with center/start/end alignment and RTL-aware horizontal start/end alignment.
- Positioning can flip to the opposite side, shift inside padded Host bounds, report available maximum width and height, or preserve the preferred coordinates when collision avoidance is disabled.
- Anchor and Host measurements use `measureInWindow`; the anchor is converted to the destination Host's local coordinates before collision calculations.
- Root Host and named PortalHost publish their measured View ref and layout version through a private geometry Context. Floating content uses its destination Host's coordinate space.
- Measurement refresh is event-driven: open, View layout, window/Host layout changes, touch movement over the trigger, and an explicit reposition key. The hook does not poll continuously and keeps content hidden until it has measurements.
- No Floating Hook, measurement helper, or geometry type is exported from the package root.

## Verification

- `pnpm run package:typecheck` — passed.
- Floating, Portal and Overlay focused tests — 38 tests passed across 3 suites before the final measurement helper assertion.
- Floating geometry and native measurement tests — 8 tests passed in 1 suite.

## Device scope

No device check was run in this batch. Real `measureInWindow` coordinates, ScrollView updates, orientation/keyboard resizing and edge placement remain for Android acceptance.

## Git state

All changes remain uncommitted. The pre-existing Batch 16B worktree changes remain present.

## Next dependency

Batch 16C.4 can consume the private Floating hook, Portal mounting and existing Overlay transitions/Back contract.
