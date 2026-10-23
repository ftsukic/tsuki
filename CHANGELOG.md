# @ftsukic/tsuki

## 0.1.5

### Patch Changes

- Fade in the ImagePreview original image after loading while keeping the preview visible underneath without a centered original-image loading indicator. Respect motion settings and reduced motion.

## 0.1.4

### Patch Changes

- f594501: 修复 Button 解除禁用或结束加载后可能保留禁用透明度的问题。共享 Pressable 动画在移除透明度覆盖时显式恢复为 1，并保留自定义透明度优先级。

## 0.1.3

### Breaking Changes

SharedImagePreview 相关旧组件、Provider、类型和独立入口已删除。升级时将来源注册迁移至 `ImagePreview.Provider`，缩略图迁移至 `ImagePreview.Source`，并按当前 ImagePreview 文档调整调用。

### Patch Changes

- c4f758a: 将 SharedImagePreview 与 ImagePreview 整合为 ImagePreview 组件族。来源注册使用 ImagePreview.Provider，缩略图使用 ImagePreview.Source；删除旧组件、Provider、类型和独立入口，不保留别名或兼容层。

  图片分页、缩放、移动、退出拖动统一由 UI 线程交互控制器处理。关闭 FlatList 原生滚动，保留虚拟化页面承载；支持同次手势在图片移动与分页之间双向交接、取消分页保留缩放，以及双击/双指立即接管分页归位。独立会话管理器统一来源测量、画面显隐交接、动画反转和旧回调失效。声明式与命令式使用同一来源范围与查看器。

  保留全屏区域 500ms 长按回调、业务 Popup 触摸隔离、原图加载与失败重试，并同步迁移全部示例和文档。

  ImagePreview.Source 支持 clipRef 登记列表可视区域，来源部分位于列表上下边界时，归位同步插值裁切范围，避免浮动图片在交接时越过列表覆盖周边内容。

  通过 type: video 与 renderMedia 扩展视频页，复用统一分页、变换和来源交接；向播放器提供 active / playing 生命周期状态，图片预加载仅处理视频封面，Example 使用 react-native-video 验证混合相册。

- f18cb32: Keep unformatted uncontrolled Input text native-owned instead of writing each edit back through value. Preserve controlled inputs and formatter behavior.
- 4a67ebe: 新增独立 @ftsukic/tsuki/teleport 入口，通过 portalBackend 配置 Teleport。默认 JS 入口无需安装 Teleport。teleport 属性弃用，启用时须迁移到显式后端配置。声明式浮层使用稳定的非阻塞容器，保持子节点重建时的叠放顺序。
- f18cb32: Add opt-in keyboardAvoiding to Popup and Dialog, animating only the necessary panel displacement with keyboard event timing and allowing Dialog body content to shrink and scroll.
- 1b6a546: 新增 Slider 滑块，支持受控与非受控数值、步长、刻度、反向、禁用与只读、无障碍增减、完成事件及主题和语义样式定制。
- 4a67ebe: 全局入口更名为 TsukiProvider，类型更名为 TsukiProviderProps。Provider 和 ProviderProps 保留为弃用别名。

## 0.1.2

### Patch Changes

- 04c2eb9: 修复 Dialog 圆角按钮文字行高与按钮高度不匹配导致的垂直错位。

## 0.1.1

### Patch Changes

- 15aa979: Add theme.mode light/dark shortcuts to Provider, ConfigProvider, and getDesignToken while preserving explicit algorithm precedence and theme inheritance.

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
