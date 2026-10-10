---
'@ftsukic/tsuki': major
---

BREAKING: Remove InteractionPressable, useInteractionPress and their press-specific public types. Use Pressable and PressableProps instead. Consolidate press state, click suppression and the animated host under Pressable while retaining existing visual feedback and SwipeCell coordination.
