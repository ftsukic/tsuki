---
'@ftsukic/tsuki': major
---

Redesign Cell props and semantic layout without compatibility aliases: rename icon/label/extra/isLink to leading/description/trailing/showArrow. Replace header/body/content/icon/extra/actions style slots with titleContainer/valueContainer/value/leading/trailing/arrow and add content/extension container styles. Keep value and adjacent extension props, and expose no private layout model or component.

Use top alignment by default and center whole first-level regions with center. Arrow display no longer implies press feedback; onPress/onLongPress or clickable enable it. Function styles can customize pressed background, explicit accessibility roles are honored, empty content no longer adds vertical spacing, and keyed Cell.Group children retain their state across insertion/reordering.

Migrate Field display props and styles. Picker-based Field adapters rename below-control description to help; description now consistently means the text below the Cell title. Cell.Group keeps extra and adds header/extraContainer styles.

Recursively wrap primitive array/Fragment content in Text, omit empty nested regions, and apply adjacent extension gaps only when the corresponding main content exists.
