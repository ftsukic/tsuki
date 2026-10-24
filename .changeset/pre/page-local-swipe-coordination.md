---
'@ftsukic/tsuki': major
---

Remove implicit SwipeCell coordination and press-scope reset from TsukiProvider. Pages must use useSwipeCellDismiss bindings for single-open behavior and outside-touch dismissal, and call its close method on scroll or blur. TsukiProvider continues to provide theme, gestures, safe-area support and imperative overlays.

Remove SwipeCellContext, SwipeCellManager, SwipeCellHandle, useSwipeCellManager and useSwipeCellController exports and their runtime integration without compatibility shims. Local SwipeCell press ownership and Portal/Popover ownership boundaries remain intact.

Register active rows through onOpenStart at gesture activation or imperative open, instead of waiting for onOpen completion. Ignore pan updates, release and stale start callbacks after a coordinated close so rapid row switches cannot reopen an old row.
