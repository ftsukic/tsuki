# @ftsukic/tsuki

## 0.1.0

### Major Changes

- 统一多个组件的语义样式槽和布局契约，包含 Badge、Button、Cell、Field、Input、Notify、Overlay、Toast 等。旧样式别名和部分旧 props 已移除，请按组件文档迁移。
- 更新 Button、Cell、Field、Input、Theme、Gesture、Pressable、Interaction 和 Icon 等公共 API；删除若干旧导出和兼容入口。请查阅下方各组件文档及迁移说明。
- 重构 Theme 配置：基础值使用 `theme.seed`，`theme.token` 仅用于派生 token 覆盖；移除 `defaultSeed`、`defaultPresetColors` 和 `composeAlgorithms` 等导出。
- 新增 Transition、MotionView、MotionPressable 和 MotionConfig，统一动画 token、Reduced Motion 与过渡中断策略。

### Minor Changes

- 增强 Dropdown、Empty、NoticeBar、Picker、Segmented 等组件的语义样式、无障碍行为、虚拟渲染和交互能力。
- 扩展 Gesture、Pressable 与 Swipe 的生命周期回调和动画策略，保留现有 worklet 与程序化控制语义。

### Patch Changes

- 修复 ActionSheet、Avatar、Button、FloatingBubble、FloatingPanel、ImagePreview、Picker、Popover、Popup、Search、SwipeCell、Switch 等组件的布局、交互、动画和无障碍问题。
- 改进 Icon、Divider、Loading、Progress、Radio、Skeleton、Tabs、Tag、Watermark 等组件的语义、样式和边界处理。

## 0.0.12

### Patch Changes

- b5083ee: Unify component interactions on the public Pressable primitive, add background and overlay pressed styles, and align press feedback and disabled behavior across the affected components, fixtures, tests, and documentation.

## 0.0.11

### Patch Changes

- 633d17c: Add the Vant-style Badge `content`, `max`, `showZero`, `position`, and standalone APIs, update the default visual baseline, and preserve `count`/`overflowCount` compatibility aliases.

## 0.0.10

### Patch Changes

- Align Navbar built-in text rendering and slot layout, prevent overlapping Input action hit areas, and add Dialog title-only examples.

## 0.0.9

### Patch Changes

- Align Dialog layouts and default action press feedback with the Vant interaction contract.

## 0.0.8

### Patch Changes

- 修复 HarmonyOS 下 Input multiline autoSize 未计入 textarea padding，导致多行输入高度增长不足及滚动阈值不准确的问题。
- 对齐 Navbar 的 Vant 风格标题与左右操作布局，补充操作禁用和语义样式能力；同时支持 Segmented 单实例圆角、选中文字颜色和 block 布局。

## 0.0.7

### Patch Changes

- Improve Popover and ImagePreview interactions, unify pressed feedback tokens, and make block Buttons and Button.Groups fill available BottomBar width without business-side flex workarounds.

## 0.0.6

### Patch Changes

- Align Cell and Field title APIs, add explicit divider control, and update the related documentation and examples.

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
