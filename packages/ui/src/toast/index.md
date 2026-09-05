---
title: Toast 轻提示
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Toast 轻提示

<section className="component-doc-intro">

## 介绍

Toast 用于反馈操作结果或展示短暂状态。支持受控组件、命令式调用、加载/成功/失败类型、位置、遮罩、点击行为和主题 token。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import {
  ConfigProvider,
  PortalHost,
  Toast,
  closeToast,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
} from '@ftsukic/react-native-ui'
```

命令式 API 和受控 `Toast` 需要 `PortalHost`。可以直接组合 `ConfigProvider` 和 `PortalHost`：

```tsx
<ConfigProvider>
  <PortalHost>
    <App />
  </PortalHost>
</ConfigProvider>
```

应用也可以使用同时提供主题和 Portal 宿主的 `Provider`；它是上述组合的便捷入口。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础类型" description="通过 text、loading、success 和 fail 展示不同语义的提示。"></code>

<code src="./__fixtures__/examples/positions.tsx" title="位置" description="使用 position 将提示放在顶部、中间或底部。"></code>

<code src="./__fixtures__/examples/interactions.tsx" title="持续显示与交互" description="duration 为 0 时保持显示，可通过实例 close、closeToast、overlay 和 forbidClick 控制生命周期与触摸行为。"></code>

<code src="./__fixtures__/examples/multiple.tsx" title="单例与多实例" description="默认复用当前提示，开启 allowMultipleToast 后可以同时展示多个提示。"></code>

<code src="./__fixtures__/examples/controlled.tsx" title="受控组件" description="直接使用 Toast，通过 show 和 onShowChange 管理显示状态。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 ConfigProvider 的 Toast token 和 semantic styles 定制外观。"></code>

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
| overlayStyle | `StyleProp<ViewStyle>` | — | 遮罩样式 |
| forbidClick | `boolean` | `false` | 是否拦截遮罩层下方触摸 |
| closeOnClick | `boolean` | `false` | 是否点击提示本身关闭 |
| closeOnClickOverlay | `boolean` | `false` | 是否点击遮罩关闭；需要 `overlay` |
| zIndex | `number` | 主题值 | 根宿主层级 |
| style | `StyleProp<ViewStyle>` | — | 提示气泡 root 样式 |
| styles | `ToastStyles` | — | `root / message / icon / loading / overlay / host` 语义样式 |
| onShowChange | `(show: boolean) => void` | — | 显示状态变化回调；自动关闭和点击关闭传入 `false` |
| onOpened | `() => void` | — | 入场动画完成后回调 |
| onClose | `() => void` | — | 关闭动画完成并卸载前回调 |

组件继承 React Native `ViewProps`，`style` 只作用于提示气泡，其他 View props 透传到气泡 root。`styles` 可以是对象或函数；函数接收 `{ props, state: { show, type, position } }`。组件使用无障碍 `alert` 语义和 `polite` live region。

### PortalHost 与命令式 API

命令式 Toast 实例直接挂载到当前 `PortalHost`；Toast 内容通过统一的 Portal 宿主渲染到应用内容上方。未挂载 `PortalHost` 时调用 `showToast` 会抛错；`closeToast()` 在没有当前实例时安全无效。`ConfigProvider` 只负责主题，不会替代 `PortalHost`。

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

`ToastInstance` 提供 `message` getter/setter 和 `close()`。默认情况下新调用会更新当前实例；`allowMultipleToast(true)` 后每次调用创建独立实例，`closeToast()` 关闭最早的实例，`closeToast(true)` 关闭全部实例。`setToastDefaultOptions` 的类型配置只作用于对应快捷方法，显式参数优先。

## 主题定制

通过 `ConfigProvider theme.components.Toast` 配置尺寸、颜色、位置和动画 token；`style` 与 `styles` 用于单次实例的外观定制。默认值按 Vant Toast 的 14px/20px 文本、96px 文本最小宽度、88px 图标态和 8px 圆角对齐。

支持的 Toast token：`maxWidth`、`fontSize`、`textColor`、`loadingIconColor`、`lineHeight`、`borderRadius`、`backgroundColor`、`iconSize`、`textMinWidth`、`textPaddingVertical`、`textPaddingHorizontal`、`defaultPadding`、`defaultWidth`、`defaultMinHeight`、`positionTopDistance`、`positionBottomDistance`、`overlayColor`、`duration`、`animationDuration` 和 `zIndex`。

当前不支持 Web Toast 的 `teleport`、`className`、HTML 字符串、URL 图标和自定义 transition；图标应使用 Icon 名称、Ant Design 图标定义或 React Element。
