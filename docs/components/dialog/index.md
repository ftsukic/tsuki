---
title: Dialog 弹出框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Dialog 弹出框

<section className="component-doc-intro">

## 介绍

Dialog 用于消息提示、操作确认和当前页面内的短交互。支持受控组件、命令式调用、异步关闭、自定义内容、遮罩和两种按钮风格。

</section>

<code src="../../../src/dialog/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import {
  ConfigProvider,
  Dialog,
  PortalHost,
  closeDialog,
  showConfirmDialog,
  showDialog,
} from '@ftsukic/tsuki'
```

命令式 API 和受控 Dialog 需要 `PortalHost`。可以直接组合 `ConfigProvider` 和 `PortalHost`：

```tsx | pure
<ConfigProvider>
  <PortalHost>
    <App />
  </PortalHost>
</ConfigProvider>
```

应用也可以使用同时提供主题和 Portal 宿主的 `Provider`；它是上述组合的便捷入口。

## 代码演示

<code src="../../../src/dialog/__fixtures__/examples/basic.tsx" title="基础提示" description="showDialog 默认只展示确认按钮。"></code>

<code src="../../../src/dialog/__fixtures__/examples/confirm.tsx" title="确认框" description="showConfirmDialog 增加取消按钮并通过 Promise 区分结果。"></code>

<code src="../../../src/dialog/__fixtures__/examples/controlled.tsx" title="受控组件" description="使用 show 和 onShowChange 管理 Dialog 的显示状态。"></code>

<code src="../../../src/dialog/__fixtures__/examples/custom.tsx" title="自定义内容" description="使用 ReactNode 标题、children 正文和 footer 自定义底部。"></code>

<code src="../../../src/dialog/__fixtures__/examples/before-close.tsx" title="异步关闭" description="beforeClose 可以阻止关闭并在检查期间显示按钮 loading。"></code>

<code src="../../../src/dialog/__fixtures__/examples/round.tsx" title="圆角按钮" description="theme 为 round-button 时使用圆角操作按钮。"></code>

<code src="../../../src/dialog/__fixtures__/examples/interactions.tsx" title="遮罩与禁用" description="展示遮罩关闭和按钮禁用行为。"></code>

<code src="../../../src/dialog/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Dialog token 和 semantic styles 定制视觉。"></code>

## API

### DialogProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `show` | `boolean` | `false` | 是否显示，配合 `onShowChange` 使用 |
| `title` | `ReactNode` | — | 标题；字符串和数字使用主题标题样式 |
| `message` | `ReactNode` | — | 正文；`children` 存在时被替换 |
| `children` | `ReactNode` | — | 自定义正文内容 |
| `footer` | `ReactNode` | — | 自定义底部；传入后替换默认按钮 |
| `width` | `DimensionValue` | `320` | 面板宽度，最大为屏幕宽度的 `90%` |
| `theme` | `'default' \| 'round-button'` | `'default'` | 默认按钮或圆角按钮风格 |
| `messageAlign` | `'left' \| 'center' \| 'right' \| 'justify'` | `'center'` | 字符串正文的对齐方式 |
| `showConfirmButton` | `boolean` | `true` | 是否显示确认按钮 |
| `showCancelButton` | `boolean` | `false` | 是否显示取消按钮 |
| `confirmButtonText` | `ReactNode` | `'确认'` | 确认按钮文案 |
| `cancelButtonText` | `ReactNode` | `'取消'` | 取消按钮文案 |
| `confirmButtonColor` | `ColorValue` | 主题主色 | 确认按钮颜色 |
| `cancelButtonColor` | `ColorValue` | 主题文本色 | 取消按钮颜色 |
| `confirmButtonDisabled` | `boolean` | `false` | 是否禁用确认按钮 |
| `cancelButtonDisabled` | `boolean` | `false` | 是否禁用取消按钮 |
| `overlay` | `boolean` | `true` | 是否显示遮罩 |
| `overlayStyle` | `StyleProp<ViewStyle>` | — | 遮罩样式 |
| `closeOnClickOverlay` | `boolean` | `false` | 点击遮罩是否关闭；关闭不触发 `beforeClose` |
| `zIndex` | `number` | 主题值 | 浮层层级 |
| `beforeClose` | `(action) => boolean \| void \| Promise<boolean \| void>` | — | 关闭前拦截，只有返回 `false` 才阻止关闭 |
| `style` | `StyleProp<ViewStyle>` | — | 弹窗面板 root 样式 |
| `styles` | `DialogStyles` | — | `host / overlay / root / header / content / message / footer / cancel / confirm` |

组件继承 React Native `ViewProps`，除 `children` 和 `style` 外透传到弹窗面板。`style` 只作用于面板；`styles.root` 也是面板样式，`styles.host` 作用于 Portal 宿主层。

`children` 使用 `undefined` 判断是否覆盖 `message`，因此传入 `null` 可以主动清空正文。字符串和数字标题/正文会自动应用主题样式，自定义 ReactNode 需要自行控制样式。正文超过视口高度的 `60%` 时可以滚动。

Dialog 使用无障碍 `alert` 和 modal 语义，遮罩不会进入无障碍导航。打开和关闭动画由主题 `motion` 控制；设置 `motion: false` 会立即完成生命周期。

### 生命周期与按钮事件

| 回调           | 说明                                                        |
| -------------- | ----------------------------------------------------------- |
| `onShowChange` | 按钮允许关闭或遮罩关闭时传入 `false`；父组件负责更新 `show` |
| `onConfirm`    | 点击确认按钮时调用，在 `beforeClose` 之前触发               |
| `onCancel`     | 点击取消按钮时调用，在 `beforeClose` 之前触发               |
| `onOpened`     | 入场动画完成后调用                                          |
| `onClose`      | 关闭动画完成、面板卸载前调用                                |

`beforeClose` 的 action 只有 `confirm` 和 `cancel`。异步检查期间对应按钮显示 loading，并暂时锁定两个默认操作按钮；返回 `false`、抛出异常或 rejected Promise 都会保持 Dialog 打开。

默认 footer 使用固定高度；显示取消按钮时，取消和确认 Button 直接作为 footer 子项并通过 `flex: 1` 平分宽度，整个半区都可点击。`theme="round-button"` 保留 footer 内边距、间隔和圆角按钮样式。

### PortalHost 与命令式 API

```text
showDialog(options?: DialogOptions): Promise<DialogAction | undefined>
showConfirmDialog(options?: DialogOptions): Promise<DialogAction | undefined>
closeDialog(): void
setDialogDefaultOptions(options: DialogOptions): void
resetDialogDefaultOptions(): void
```

`showDialog` 默认只有确认按钮，确认后 Promise resolve `'confirm'`。`showConfirmDialog` 默认增加取消按钮，确认 resolve `'confirm'`，取消 reject `'cancel'`。两个函数共用一个当前实例；新调用会更新当前内容。`closeDialog` 只关闭当前实例，不主动结算未完成 Promise。

命令式 options 不包含 `show` 和生命周期回调，显式 options 优先于 `setDialogDefaultOptions`。未挂载 `PortalHost` 时，命令式调用会抛出错误；`closeDialog()` 在没有当前实例时安全无效。`ConfigProvider` 只负责主题，不会替代 `PortalHost`。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.Dialog` 配置面板、标题、正文、按钮、间距、动画和层级 token：

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      Dialog: {
        backgroundColor: '#172b3a',
        borderRadius: 20,
        messageColor: '#d9f7be',
      },
    },
  }}
>
  <Dialog show message="主题正文" />
</ConfigProvider>
```

可覆盖的主要 token 包括 `width`、`smallScreenWidth`、`backgroundColor`、`overlayColor`、`borderRadius`、`titleColor`、`messageColor`、`fontSize`、`titleFontSize`、`titleLineHeight`、`messageLineHeight`、`headerFontWeight`、标题和正文间距、`messageMaxHeightRatio`、按钮高度与颜色、分隔线颜色、footer 间距、`animationDuration` 和 `zIndex`。

当前不支持 Vant 的 `allowHtml`、`teleport`、`closeOnPopstate`、`lockScroll`、`keyboardEnabled`、prompt 输入框和 Web transition/class API；React Native 自定义内容请使用 `ReactNode`。
