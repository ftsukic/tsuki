---
'@ftsukic/tsuki': minor
---

Add Picker virtual rendering, enabled by default for long columns, with virtual={false} for full rendering and automatic full rendering for screen readers. Date and time pickers and Field adapters inherit the option.

Avoid unnecessary numeric option scans and per-option press animation initialization in Picker while retaining the shared press interaction handling.
