---
'@ftsukic/tsuki': major
---

BREAKING: The root usePanGesture now uses the RNGH API (direction, gesture and shared values). Remove useGesturePan, GesturePanOptions, GesturePanResult and the old responder-specific public types. Use UsePanGestureOptions and UsePanGestureResult from the package root. Move FloatingPanel responder handling into a private Gesture hook without changing its responder behavior, and remove the remaining Interaction module.
