---
'@ftsukic/tsuki': patch
---

Fix ImagePreview thumbnail transitions: preserve image proportions and crop alignment, wait for the native transition image to load, fade the mask, and hand off to the pager without a blank frame. Restore fullscreen mask, controls, and loading/error regions on React Native versions that removed StyleSheet.absoluteFillObject.

Prevent first-opening flashes by starting all presentation layers transparent, waiting for native layout before animation, synchronizing transition visibility with its UI-thread progress, and retaining the transition image until the newly mounted pager image has loaded, including cached sources.
