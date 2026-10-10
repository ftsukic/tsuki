---
'@ftsukic/tsuki': major
---

Replace component semantic style contracts with Ant Design inspired slot names and consistent root/container boundaries. Remove legacy styling aliases and dedicated style props; migrate compound component styling to nested popup/toolbar and child component configurations. Remove the deprecated Button.plain prop; use variant="outlined" instead. Remove public Input.embedded and PickerColumn implementation exports. Consumers must migrate using the semantic styles guide; no compatibility layer is provided.
