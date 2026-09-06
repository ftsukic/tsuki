---
title: Notify 消息通知
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Notify 消息通知

<section className="component-doc-intro">

## 介绍

Notify 用于在页面顶部或底部展示全宽消息通知，支持命令式调用、受控组件、通知类型、自定义颜色和自动关闭。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import {
  ThemeProvider,
  Notify,
  Provider,
  closeNotify,
  resetNotifyDefaultOptions,
  setNotifyDefaultOptions,
  showNotify,
} from '@ftsukic/react-native-ui'
```

命令式 API 和 `Notify` 推荐在应用根部统一使用 `Provider`：

```tsx | pure
<Provider>
  <App />
</Provider>
```

同一棵 React 树只支持一个 `Provider`。Notify 不显示遮罩，也不会阻塞底层触摸。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="展示默认通知和 primary、success、danger、warning 四种类型。"></code>

<code src="./__fixtures__/examples/custom.tsx" title="自定义配置" description="使用 color、background、position 和 duration 配置通知。"></code>

<code src="./__fixtures__/examples/controlled.tsx" title="受控组件" description="通过 show 和 onShowChange 管理通知，并使用 children 自定义内容。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 ThemeProvider 的 Notify token 定制通知外观。"></code>

## API

### NotifyProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| show | `boolean` | `false` | 是否显示；受控模式下配合 `onShowChange` 使用 |
| type | `'primary' \| 'success' \| 'danger' \| 'warning'` | `'danger'` | 通知类型 |
| message | `string \| number` | `''` | 通知内容；`children` 存在时被忽略 |
| children | `ReactNode` | — | 自定义内容，对应 Vant default slot |
| duration | `number` | `3000` | 自动关闭毫秒数；`0` 表示持续显示 |
| position | `'top' \| 'bottom'` | `'top'` | 通知位置 |
| color | `string` | 主题文本色 | 文本颜色 |
| background | `string` | 按 type 映射 | 背景颜色，显式值优先 |
| zIndex | `number` | 主题值 | 通知层级 |
| onPress | `(event: GestureResponderEvent) => void` | — | 点击通知回调，对应 Vant `onClick` |
| onShowChange | `(show: boolean) => void` | — | 自动关闭时回调 `false` |
| onOpened | `() => void` | — | 入场动画完成后回调 |
| onClose | `() => void` | — | 关闭动画完成后回调 |

`Notify` 继承 React Native `ViewProps`，但不支持 `style`、`styles`、`lockScroll`、`teleport`、`className` 和 HTML 字符串。组件使用 `alert` 无障碍语义和 `polite` live region。

### Provider 与命令式 API

命令式 Notify 直接通过当前 `Provider` 的 Portal 宿主管理单例、定时器和关闭生命周期；重复调用会更新当前通知并重新计时。`Notify` 声明式组件也只创建一个 Portal entry。

### 命令式 API

```text
showNotify(input: NotifyOptions | string | number): NotifyInstance
closeNotify(): void
setNotifyDefaultOptions(options: NotifyOptions): void
resetNotifyDefaultOptions(): void
```

`showNotify` 返回的 `NotifyInstance` 提供 `close()`。默认类型为 `danger`，默认位置为 `top`，默认持续时间为 `3000ms`。未挂载 `PortalHost`（或 `Provider`）时调用 `showNotify` 会抛出错误；没有当前实例时 `closeNotify()` 无操作。

### 主题定制

通过 `ThemeProvider theme.components.Notify` 配置：

| Token             | 默认值                   | 说明         |
| ----------------- | ------------------------ | ------------ |
| textColor         | `colorWhite`             | 文本颜色     |
| paddingVertical   | `paddingXS`              | 垂直内边距   |
| paddingHorizontal | `paddingMD`              | 水平内边距   |
| fontSize          | `fontSize`               | 字号         |
| lineHeight        | `lineHeight`             | 行高         |
| primaryBackground | `colorPrimary`           | primary 背景 |
| successBackground | `colorSuccess`           | success 背景 |
| dangerBackground  | `colorError`             | danger 背景  |
| warningBackground | `colorWarning`           | warning 背景 |
| duration          | `3000`                   | 默认持续时间 |
| zIndex            | `zIndexPopupBase + 1000` | 默认层级     |
