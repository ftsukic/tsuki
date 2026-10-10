---
'@ftsukic/tsuki': major
---

BREAKING: Remove InteractionCoordinator, useInteraction and their context/coordinator types, plus interactionId from Pressable and SwipeCellAction. Coordinate expanded cells through the Provider SwipeCellManager and private press ownership context. Portal and Popover floating content clear cell ownership. Group coordination and the public SwipeCell controller remain available.
