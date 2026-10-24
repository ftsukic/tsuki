---
'@ftsukic/tsuki': minor
---

Improve SwipeCell gesture settlement with velocity projection and critically damped momentum, and settle interrupted gestures without leaving rows partially open. Expand contiguous action regions proportionally to drag distance, keeping the outer edge anchored and labels single-line and unscaled. Retain the resting label layout during closing and occlude it with adjacent actions instead of reflowing labels into shrinking regions; hide actions while measuring. Measure the resting widths independently of the animated visible regions. Add an optional contentDragLimit to synchronize limited content travel, fade and overlaid action reveal, with a themed non-interactive content overlay that follows reveal progress. In limited-content mode, one settlement progress drives content, actions and fade. Add a small derived body rebound only at the end of opening; closing has one animation and completion. Preserve the current visual position when interrupted. Preserve imperative timing for the default unrestricted layout.

When actions are open, tapping or holding the content only dismisses them, without content press feedback or nested library press callbacks. Restore normal interaction on the next touch.

Add useSwipeCellDismiss for page-local outside-touch dismissal and single-open coordination without a dedicated Provider. Observe the root responder capture without intercepting touches, measure rows in page coordinates, and ignore stale measurements and recycled row callbacks. Add native measurement to built-in SwipeCell refs and a public SwipeCell + FlashList example.

Give SwipeCell its own pressedBackgroundColor component token, derived from the global alias and independent of Cell component overrides.
