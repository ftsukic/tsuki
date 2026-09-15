# @ftsukic/tsuki

## 0.0.5

### Patch Changes

- Make package content validation robust when the package lifecycle runs in CI.

## 0.0.4

### Patch Changes

- Align ActionSheet action fields and imperative result handling with the current API, update related component fixtures and documentation, and fix package installation so consuming projects no longer run the library's Husky setup.

## 0.0.3

### Patch Changes

- 修复 Search 在不同 action 场景下的高度异常。

## 0.0.2

### Patch Changes

- 2cba51e: Fix component interaction and layout details, including Search input vertical alignment, single-line Input shell focus behavior, Button text alignment, and Icon touch handling.

## 0.0.1

### Major Changes

- 1561d36: Rename the public Button variant from `outlined` to `outline`; the deprecated `plain` prop now maps to `outline`.
- 1561d36: Remove the public `LoadingIcon` and `LoadingIconProps` APIs. Make `Loading` the canonical loading component and add Vant-style `loadingType` and `loadingSize` props to Button.
- 99ba6c4: Reset the theme contract for React Native consumers: line heights are absolute values, motion durations are milliseconds, and the public component surface no longer includes placeholder Helpers, Hooks, or LocaleProvider APIs.

### Minor Changes

- a82702d: Add a Vant-style ActionSheet with controlled and imperative APIs, action states, shared bottom Popup positioning, safe-area support, and theme tokens.
- d65114c: Add the layout-only `BottomBar` component for fixed bottom content, safe-area handling, and arbitrary children.
- 1561d36: Add the connected `Button.Group` and named `ButtonGroup` APIs with inherited sizing and block layout for React Native.
- 3999a8f: Add Vant-style DatePicker, TimePicker, and DateTimePicker components with configurable date/time wheels, Date or string-array values, and imperative popup controls, plus FieldDatePicker, FieldTimePicker, and FieldDateTimePicker adapters that commit values on confirmation.
- 75f450e: Add an independent Portal-based ImagePreview with multi-image paging, zoom gestures, interactive dismiss, and thumbnail transitions.
- e8005c4: Restore Navbar to the Vant title/left/right API with a centered title and NavbarAction side actions.
- 34453b6: 新增 Vant 风格的 Picker、PickerView、PickerToolbar，支持原生滚轮吸附、多列、级联、Popup 和 Field 组合。
- 5b95c96: 新增 Skeleton 骨架屏组件，支持头像、标题、段落宽度、主题 token、语义样式和可关闭的呼吸动画。
- 25aa816: Add a Vant-style Swipe carousel and SwipeItem with loop, autoplay, vertical layout, indicators, and imperative navigation.
- 032e907: Add Vant-style Tabs and align Segmented with ButtonGroup shape, shared Button sizing, unified press feedback, active theme tokens, and animated active states.
