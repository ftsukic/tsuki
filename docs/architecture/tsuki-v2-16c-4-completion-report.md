# Batch 16C.4 — Tooltip and Popover Completion Report

## Delivered

- Added public `Tooltip` and `Popover` components and their prop, style, class-name and placement types to the v2 package entry point.
- `Tooltip` accepts string or ReactNode content, uses long-press by default, supports press and controlled/uncontrolled visibility, and renders through the normal Portal path. It has no full-screen hit target and does not participate in Overlay Back handling.
- `Popover` accepts interactive ReactNode content, supports controlled/uncontrolled visibility, outside-press dismissal and Android Back, and retains the Overlay exit lifecycle with the default fade mask and scale-fade content transition.
- Both components consume the private Floating hook for Host-local positioning, collision handling and explicit `repositionKey` updates. Theme semantic colors, NativeWind `classNames`, React Native `styles`, and trigger accessibility states and hints are supported.
- Added canonical fixtures and v2 component docs for Tooltip and Popover. The Tooltip placement fixture places its bottom triggers close to the Root Host edge to exercise collision flipping on Android.
- No public Floating hook or internal Registry/Host APIs were added. No v1 compatibility layer was introduced; this implementation targets v2 as requested.

## Key behavior and architecture

- Portal remains a mounting primitive and does not acquire Overlay mask, Back, transition or modal-isolation behavior.
- Tooltip uses Portal and a pointer-transparent informational bubble. Popover uses OverlayPortal because it needs outside hit testing, Back dismissal and retained exit transitions.
- Both components share Floating placement and measurement without sharing the same visibility or dismissal state machine.
- Portal Theme bridging and Root isolation remain in the Root-scoped Registry; arbitrary external React Context values are not promised across the Portal boundary.

## Verification

- `pnpm run package:typecheck` — passed.
- `pnpm run package:fixtures:typecheck` — passed.
- `pnpm run playground:typecheck` — passed.
- `pnpm run consumer:v4:typecheck` and `pnpm run consumer:v5:typecheck` — passed.
- `pnpm run package:test:v2` — 22 suites and 183 tests passed.
- `pnpm run playground:test` — 10 suites and 35 tests passed. Jest emitted the existing Reanimated warning from the v1 FloatingPanel fixture.
- `pnpm run fixtures:generate` — generated 67 component fixtures; `pnpm run fixtures:check` verified all 67.
- `pnpm run lint` — passed.
- `pnpm run build` — passed; Bob compiled 114 source files. It emitted the existing CommonJS `esm` / `exports.require` configuration warning.
- Focused Prettier check and `git diff --check` — passed.

## Android acceptance

- The requested `emulator-5554` serial was not available. Acceptance was performed on the booted `Pixel_10` Android emulator using the existing development client and Metro port `18761`.
- Normal Portal entries rendered concurrently and updated in place. A named PortalHost could be unmounted and restored without leaving stale content. Switching the Portal fixture theme updated its bridged color.
- Tooltip long-press opened the hint; tapping another trigger while it was open still reached that trigger, confirming the Tooltip does not install an outside hit target. At the lower edge, the `Bottom right` Tooltip appeared above its trigger and remained inside the Host.
- In the nested ScrollView fixture, the visible anchor moved from `y=1936` to `y=1685` during a 251 px scroll, and the Tooltip moved from `y=1832` to `y=1581` in the same gesture.
- Popover interactive content responded to an action; outside press and Android Back dismissed it. Automated tests cover Root isolation and Registry cleanup.

## Scope and Git state

- Android acceptance is complete for this batch. iOS, HarmonyOS and TalkBack remain deferred as specified by the plan; keyboard and orientation changes were not device-verified.
- Changes remain uncommitted. Existing dirty Batch 16B work and other starting worktree changes were preserved.

## Next dependency

Batch 17 (Dialog) can build on the completed Portal, Floating and Overlay foundations.
