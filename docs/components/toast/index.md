# Toast 轻提示

## 介绍

Toast 用于反馈操作结果或展示短暂状态。支持受控组件、命令式调用、加载/成功/失败类型、位置、遮罩、点击行为和主题 token。

- [组件预览](../../../src/toast/__fixtures__/overview.tsx)

## 引入

```tsx
import {
  ConfigProvider,
  Toast,
  closeToast,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
} from '@ftsukic/tsuki'
```

命令式 API 和受控 `Toast` 需要 Teleport `PortalProvider` 与 TsukiProvider。应用应将 PortalProvider 放在 TsukiProvider 外层。

## 代码演示

- [基础类型：通过 text、loading、success 和 fail 展示不同语义的提示。](../../../src/toast/__fixtures__/examples/basic.tsx)

- [位置：使用 position 将提示放在顶部、中间或底部。](../../../src/toast/__fixtures__/examples/positions.tsx)

- [持续显示与交互：duration 为 0 时保持显示，可通过实例 close、closeToast、overlay 和 forbidClick 控制生命周期与触摸行为。](../../../src/toast/__fixtures__/examples/interactions.tsx)

- [单例与多实例：默认复用当前提示，开启 allowMultipleToast 后可以同时展示多个提示。](../../../src/toast/__fixtures__/examples/multiple.tsx)

- [受控组件：直接使用 Toast，通过 show 和 onShowChange 管理显示状态。](../../../src/toast/__fixtures__/examples/controlled.tsx)

- [主题定制：通过 ConfigProvider 的 Toast token 和 semantic styles 定制外观。](../../../src/toast/__fixtures__/examples/theme.tsx)

## API

### ToastProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| show | `boolean` | `false` | 是否显示；受控模式下配合 `onShowChange` 使用 |
| type | `'text' \| 'loading' \| 'success' \| 'fail'` | `'text'` | 提示类型；success/fail 默认显示对应图标，loading 默认显示 `Loading` |
| message | `string \| number \| ReactNode` | `''` | 提示内容；字符串和数字使用主题文本样式 |
| children | `ReactNode` | — | 自定义内容，优先于 `message`，并允许提示内容接收点击 |
| icon | `IconName \| IconDefinition \| ReactElement \| null` | — | 自定义图标；传 `null` 可移除 success/fail 默认图标 |
| iconSize | `number` | `36` | 图标或加载指示器尺寸 |
| position | `'top' \| 'middle' \| 'bottom'` | `'middle'` | 提示位置 |
| duration | `number` | `2000` | 自动关闭毫秒数；`0` 表示不自动关闭，负数按 `0` 处理 |
| loadingType | `'circular' \| 'spinner'` | `'circular'` | `type="loading"` 时的指示器类型 |
| overlay | `boolean` | `false` | 是否显示全屏遮罩 |
| forbidClick | `boolean` | `false` | 是否拦截遮罩层下方触摸 |
| closeOnClick | `boolean` | `false` | 是否点击提示本身关闭 |
| closeOnClickOverlay | `boolean` | `false` | 是否点击遮罩关闭；需要 `overlay` |
| zIndex | `number` | 主题值 | 根宿主层级 |
| style | `StyleProp<ViewStyle>` | — | 提示气泡 root 样式 |
| styles | `ToastStyles` | — | `root`、`content`、`icon`、`loading`、`mask` 语义样式；支持对象或函数。 |
| onShowChange | `(show: boolean) => void` | — | 显示状态变化回调；自动关闭和点击关闭传入 `false` |
| onOpened | `() => void` | — | 入场动画完成后回调 |
| onClose | `() => void` | — | 关闭动画完成并卸载前回调 |

组件继承 React Native `ViewProps`，`style` 和 `styles.root` 作用于提示气泡，其他 View props 也透传到气泡 root。定位使用 `position`，不公开内部定位层样式。`styles.content` 对字符串和数字作用于文本，对 ReactNode 或 `children` 作用于内容容器。`styles` 可以是对象或函数；函数接收 `{ props, state: { show, type, position } }`。组件使用无障碍 `alert` 语义和 `polite` live region，退出期间隐藏无障碍内容。

### Teleport 与命令式 API

命令式 Toast 由 TsukiProvider 内部承载器管理，并通过 Teleport 渲染到 `root` 宿主。使用前应用需挂载 Teleport `PortalProvider` 和 TsukiProvider。

### 命令式 API

```text
showToast(input?: ToastOptions | string | number): ToastInstance
showLoadingToast(input?: ToastOptions | string | number): ToastInstance
showSuccessToast(input?: ToastOptions | string | number): ToastInstance
showFailToast(input?: ToastOptions | string | number): ToastInstance
closeToast(all?: boolean): void
allowMultipleToast(value?: boolean): void
setToastDefaultOptions(options: ToastOptions): void
setToastDefaultOptions(type: ToastType, options: ToastOptions): void
resetToastDefaultOptions(type?: ToastType): void
```

`ToastInstance` 提供 `message` getter/setter 和 `close()`。默认情况下新调用会更新当前实例并重新计时（即使内容相同）；`allowMultipleToast(true)` 后每次调用创建独立实例，`closeToast()` 关闭最早的实例，`closeToast(true)` 关闭全部实例。`setToastDefaultOptions` 的类型配置只作用于对应快捷方法，显式参数优先。

## 主题定制

通过 `ConfigProvider theme.components.Toast` 配置尺寸、颜色、位置和动画 token；`style` 与 `styles` 用于单次实例的外观定制。默认值按 Vant Toast 的 14px/20px 文本、96px 文本最小宽度、88px 图标态和 8px 圆角对齐。

支持的 Toast token：`maxWidth`、`fontSize`、`textColor`、`loadingIconColor`、`lineHeight`、`borderRadius`、`backgroundColor`、`iconSize`、`textMinWidth`、`textPaddingVertical`、`textPaddingHorizontal`、`defaultPadding`、`defaultWidth`、`defaultMinHeight`、`positionTopDistance`、`positionBottomDistance`、`overlayColor`、`duration`、`animationDuration` 和 `zIndex`。

当前不支持 Web Toast 的 `teleport`、`className`、HTML 字符串、URL 图标和自定义 transition；图标应使用 Icon 名称、Ant Design 图标定义或 React Element。
