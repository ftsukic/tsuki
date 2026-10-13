---
'@ftsukic/tsuki': major
---

Move Notify style, styles.root and inherited ViewProps to the notification body. Remove styles.container without a compatibility alias; migrate container styles to root. Positioning and animation wrappers no longer expose public styling slots.

Keep styles.content scoped to built-in text, honor Notify.textColor when color is omitted, and hide the notification from accessibility during exit.
