---
title: ActionSheet 动作面板
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# ActionSheet 动作面板

<section className="component-doc-intro">

## 介绍

基于底部 Popup 的操作选择面板，支持受控用法、异步队列、操作状态、局部语言与主题。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { ActionSheet, Provider, showActionSheet, closeActionSheet } from '@ftsukic/react-native-ui'
```

在应用根部包裹 Provider。函数式操作使用根主题和语言；声明式面板保留局部 Theme/Locale。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础选择与队列" description="连续请求依次展示，选择和取消返回结果。"></code> <code src="./__fixtures__/examples/states.tsx" title="状态与副标题" description="图标、颜色、禁用和加载项。"></code> <code src="./__fixtures__/examples/custom.tsx" title="自定义内容与布局" description="替换操作列表、调整高度和安全区。"></code> <code src="./__fixtures__/examples/theme.tsx" title="主题与连续选择" description="局部 token、语义样式、语言和保持打开。"></code>

## API

### ActionSheetProps&lt;T&gt;

继承 PopupProps（除 position/styles），包括 RN ViewProps、overlay、overlayStyle、duration、round、lazyRender、destroyOnClosed、zIndex、键盘避让和生命周期。固定 position=bottom；RN ViewProps 透传到面板，默认使用 accessibilityViewIsModal，操作项是带 disabled/busy 状态的 button。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| open | boolean | false | 受控显示 |
| onOpenChange | (open: boolean) => void | — | 请求关闭，调用方更新状态 |
| title / description | ReactNode | — | 标题/说明，文本自动应用样式 |
| actions | ActionSheetAction&lt;T&gt;[] | [] | 操作项 |
| children | ReactNode | — | 替换操作列表，null 清空 |
| cancelText | string | 当前语言“取消” | 空串隐藏取消区 |
| closeable | boolean | true | 显示标题区关闭按钮 |
| closeOnClickAction | boolean | true | 声明式选择后是否请求关闭 |
| closeOnOverlayPress / closeOnBackPress | boolean | true | 点击遮罩或返回键取消 |
| safeAreaInsetBottom | boolean | true | 追加底部安全区 |
| safeAreaInsetTop | boolean | false | 追加顶部安全区 |
| round | boolean | true | 顶部圆角 |
| onSelect | (item: ActionSheetAction&lt;T&gt;, index: number) => void | — | 可用项选择事件 |
| onCancel | () => void | — | 取消按钮、关闭按钮、遮罩或返回键取消 |
| onOpen / onOpened | () => void | — | 开始进入/进入完成 |
| onClose / onClosed | () => void | — | 开始退出/退出完成 |
| style | StyleProp&lt;ViewStyle&gt; | — | 面板根样式 |
| styles | 对象或 StyleResolver | — | root/header/title/description/content/action/name/subname/cancel |

styles 函数接收 `{ props, state: { open } }`。header/content/action/cancel 是 View 样式，title/description/name/subname 是 Text 样式。长列表可滚动，最大内容高度默认窗口的 80%。关闭时等待 Popup 面板与遮罩动画完成。

### ActionSheetAction&lt;T&gt;

`name: string` 必填。可选 `key: React.Key`、`subname: string`、`icon: ReactNode`、`color: ColorValue`、`disabled: boolean`、`loading: boolean`、`value: T`、`callback(item, index): void`。disabled/loading 默认 false，均不可选择；callback 在 onSelect 前调用，Promise 生命周期不等待 callback。图标和自定义 ReactNode 自行控制尺寸。

### 函数式 API

`showActionSheet<T>(options?: ShowActionSheetOptions<T>): Promise<ActionSheetResult<T>>`。

ShowActionSheetOptions 排除 open/onOpenChange/closeOnClickAction；固定选择后关闭。结果为 `{ action: 'select', item, index }` 或 `{ action: 'cancel' }`，取消不 reject。每个组件维护自己的 FIFO 队列，结果立即返回，下一项等待退出完成后显示。

`closeActionSheet(): void` 强制取消当前项，保留等待队列；无当前项时无操作。Host 卸载时当前及等待项全部返回 cancel。未挂载 Host 时 showActionSheet 同步抛错。

### 主题与语言

`theme.components.ActionSheet` 支持 `maxHeightRatio`、`itemHeight`、`fontSize`、`subnameFontSize`、`cancelGap`、`padding`、`backgroundColor`、`textColor`、`secondaryColor`、`disabledColor`、`gapColor`、`activeColor`。默认最小项高 52，字号来自主题大字号，颜色来自 alias token。

`locale.ActionSheet.cancelText/closeLabel` 默认“取消”/“关闭”；显式 cancelText 优先。

不支持 teleport、className、HTML 字符串、命名 Host、函数式多选或异步 callback 拦截。无额外 Group API。
