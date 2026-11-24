# Tsuki v2 Batch 16C — Portal, Floating and Anchored Components

## Scope

Batch 16C adds general Portal mounting, Root-scoped named PortalHosts, private anchor measurement and positioning, and the public Tooltip and Popover components. It builds on the Root Registry and View Host while keeping mounting, geometry and interaction policy in separate modules.

## Runtime ownership

- Each root `TsukiProvider` owns one `OverlayRegistry` and the single default `OverlayHost`. Nested providers inherit both.
- Portal entries use a separate collection, subscription and ID sequence from Overlay entries. The Registry assigns both kinds a shared mount order so the default Host can render them in one ordered stack.
- A Portal entry contains only its owner, target name, children and captured Tsuki theme scope. It has no mask, transition, Back behavior or modal accessibility mode.
- Named targets use a second Root-scoped map. The name `root` is reserved for the default Host. Registering a second live Host with the same name in one Root is an error; equal names in different Roots are independent.
- Unregistering a named Host suspends rendering at that target. It does not remove its Portal entries. A later Host registration resumes rendering in the original order.
- Theme changes update entries captured from that Theme scope. Arbitrary application Context is not automatically bridged.

## Component boundaries

| Capability | Responsibility |
| --- | --- |
| Portal | Mount arbitrary children at a named target and update or remove the owned entry. |
| PortalHost | Register one named target and render entries assigned to it inside its local React Native View bounds. |
| Floating | Measure an anchor and content, convert window coordinates to Host-local coordinates, and compute placement, flipping and boundary shifts. |
| Tooltip | Show lightweight information through a normal Portal; use a mobile press gesture rather than hover. |
| Popover | Manage controlled or uncontrolled visibility, outside press and Back; use the Overlay lifecycle for exit and motion. |
| Overlay | Own masking, transitions, Back distribution, modal accessibility and retained exit lifecycle. |

Tooltip and Popover share private Floating calculations. Tooltip uses a regular Portal and does not enter Overlay Back or accessibility isolation. Popover uses the Overlay Portal primitive because it owns outside-press and Back dismissal and needs the Overlay exit lifecycle.

## Floating geometry

`measureInWindow` is used for both the anchor and the destination Host. The anchor rectangle is translated by the Host's measured window origin before placement. Named Host bounds, rather than screen bounds, are the local collision boundary. Positioning itself is a pure calculation over the local anchor, content size and boundary rectangle.

Measurements run when a floating entry opens, either measured View lays out, window or Host layout changes, touch movement occurs over the anchor, or the consumer changes `repositionKey`. This gives ScrollView owners an event-driven way to request a refresh from their `onScroll`; the runtime does not poll continuously. Floating content remains visually hidden until both anchor and content measurements are available.

## Public API boundary

The package root exports `Portal`, `PortalHost`, `Tooltip` and `Popover`, along with their public prop and placement types. Registry operations, Host registration tokens, geometry helpers, measurements and Floating hooks stay private. The root exports do not add a generic Floating component or hook.

Each public component has a canonical fixture under its own `__fixtures__/` directory. Playground previews load the same fixture source through the generated catalog. Component documentation describes the implemented API and its platform boundaries.
