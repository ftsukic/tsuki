---
'@ftsukic/tsuki': major
---

Treat Provider gesture/safeArea and standalone root-provider enabled props as initialization options so later prop changes do not remount application content. Use a new key to explicitly change root capabilities; theme and motion remain reactive.

Track imperative Portal keys by their original host so updates and closes continue to work when another Provider mounts. Release key ownership when the entry or its host unmounts.
