---
'@ftsukic/tsuki': major
---

Remove Button round/square/circle boolean aliases; use shape instead. Migrate Dialog actions and component examples to the shape API.

Remove legacy Icon exports (AntdNativeIcon, AntdNativeIconProps, iconDefinitions, isIconName and third-party icon re-exports) and Field getFieldStatusColor/getFieldStyles exports. Import third-party icon definitions directly from @ant-design/icons-svg; use public semantic styles for Field customization. No compatibility adapters remain.
