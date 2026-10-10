---
'@ftsukic/tsuki': major
---

Rebuild theme configuration without compatibility adapters. Base inputs now use `theme.seed`; `theme.token` accepts only derived overrides. Base text/background colors are optional algorithm inputs, and dark neutrals derive from them. Ignore undefined overrides, unify effective motion across token hooks, and avoid rerunning visual algorithms for motion-only changes. Remove public exports for defaultSeed, defaultPresetColors and composeAlgorithms; compose through the algorithm array instead.
