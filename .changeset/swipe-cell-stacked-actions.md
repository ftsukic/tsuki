---
'@ftsukic/tsuki': patch
---

Expand SwipeCell actions with overlapping transforms driven by the content offset. Preserve measured action widths, mirror left actions, close content on taps instead of touch start, and respect fast reverse swipes when settling.

Use non-bouncing timing for both opening and closing. Adapt the WeChat fixture to theme tokens and remove deleted rows only after the closing animation completes.

Route content, external cell, action and imperative closing through the same UI-thread settlement as gesture closing, and ignore duplicate close requests during the transition.

Use the theme medium duration (200ms by default) for SwipeCell transitions and preserve active content dragging when measured action widths change, settling against the latest widths on release.

Delay SwipeCell content visual press feedback by 80ms and cancel it on horizontal or vertical movement, including nested library Cell and Pressable feedback, without delaying business press callbacks or action feedback.

Initialize each content touch only once so native pressIn before touchStart still shows delayed feedback, while preserving cancellation during dragging and successive Web mouse presses.
