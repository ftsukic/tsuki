---
'@ftsukic/tsuki': major
---

Separate Button type shortcuts from semantic color and variant. Add mutually exclusive danger, success and warning shortcuts; accept semantic names through color. Map default/primary/dashed/text types to their variants and rename outline to outlined, including Checkbox and Radio buttonVariant. Explicit color and variant take precedence.

Remove Button.plain and legacy label/contentContainer style slots; use variant and styles.content. Remove loadingText, preserve children during loading and replace the regular icon at iconPosition. Fix loading spacing, support block text buttons and explicitly allocate equal widths in block groups.
