---
'@ftsukic/tsuki': patch
---

Manage Button icon/loading spacing through root columnGap instead of icon margins. Keep children grouped in a private content region so array and Fragment pieces do not receive extra icon gaps, omit empty content regions, and preserve zero content and circle spacing. Existing Button props, iconGap tokens, and semantic text styles remain unchanged.
