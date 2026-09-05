---
title: Popup 弹出层
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Popup 弹出层

<section className="component-doc-intro">

## 介绍

Popup 用于在当前页面上方展示内容，支持居中、四边定位、遮罩、圆角、懒渲染、销毁和按 Native Stack 语义实现的滑入动画。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Popup, Provider } from '@ftsukic/react-native-ui'
```

Popup 推荐挂载在应用根节点的 `Provider` 内：

```tsx | pure
<Provider>
  <App />
</Provider>
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="使用 visible 受控显示居中弹层。"></code>

<code src="./__fixtures__/examples/positions.tsx" title="五种位置" description="支持 center、top、bottom、left 和 right，并按位置处理 round 圆角。"></code>

<code src="./__fixtures__/examples/interactions.tsx" title="遮罩交互" description="通过 overlay、onPressOverlay 和 closeOnPressOverlay 管理遮罩点击。"></code>

<code src="./__fixtures__/examples/lifecycle.tsx" title="生命周期与销毁" description="观察打开、关闭回调，并使用 destroyOnClosed 销毁内容。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Popup token 和 semantic styles 定制浮层。"></code>

## API

### PopupProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | `false` | 是否显示；Popup 是受控组件 |
| position | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'center'` | 弹出位置 |
| overlay | `boolean` | `true` | 是否显示全屏遮罩；遮罩默认拦截底层触摸 |
| closeOnPressOverlay | `boolean` | `false` | 点击遮罩时是否发出 `onRequestClose` 请求 |
| onPressOverlay | `(event) => void` | — | 点击遮罩回调 |
| onRequestClose | `() => void` | — | 关闭请求回调，也用于 Android 返回键；调用方应更新 `visible` |
| duration | `number` | 主题 `animationDuration` | 动画毫秒数；非正数按 `0` 处理 |
| round | `boolean` | `false` | 使用主题圆角；四边定位只裁剪靠近内容中心的一侧 |
| lazyRender | `boolean` | `true` | 初次显示前不挂载 children |
| destroyOnClosed | `boolean` | `false` | 关闭动画完成后是否卸载 children |
| zIndex | `number` | 主题 `zIndex` | Popup 宿主层级 |
| style | `StyleProp<ViewStyle>` | — | 面板样式 |
| overlayStyle | `StyleProp<ViewStyle>` | — | 遮罩样式，`opacity` 会作为动画终点透明度 |
| styles | `PopupStyles` | — | `root / panel / overlay` 语义样式 |
| onOpen | `() => void` | — | 开始打开动画时回调 |
| onOpened | `() => void` | — | 打开动画完成时回调 |
| onClose | `() => void` | — | 开始关闭动画时回调 |
| onClosed | `() => void` | — | 关闭动画完成时回调 |

组件还继承 React Native `ViewProps`（`children` 和 `style` 除外），其余 View props 会透传到面板，并且 ref 指向面板 root。`style` 只作用于面板；`styles.root` 作用于全屏宿主，`styles.panel` 作用于面板，`styles.overlay` 作用于遮罩。

Popup 不会自动修改 `visible`。`closeOnPressOverlay` 和 Android 返回键都只是发出 `onRequestClose`，需要由父组件设置 `visible={false}`。未提供 `onRequestClose` 时 Android 返回键返回 `false`，继续交给更底层的返回处理器。

`center` 面板按内容尺寸布局；`top` 和 `bottom` 默认占满可用宽度；`left` 和 `right` 默认占满可用高度。显式 `style` 可以覆盖这些尺寸。方向面板使用从对应边缘滑入/滑出的动画，居中面板使用淡入和轻微缩放，遮罩独立淡入淡出。动画运行时快速切换 `visible` 会从当前进度继续。

`lazyRender` 只控制首次挂载；关闭后默认保留内容状态，`destroyOnClosed` 会在关闭动画完成后卸载内容。若动画被新的 `visible` 状态中断，不会触发被取消的完成回调。

面板继承调用方传入的无障碍属性。遮罩不进入无障碍元素导航；需要明确语义时，应在 children 上提供 `accessible`、`accessibilityRole` 和 `accessibilityLabel`。

首版不支持 `closeable`、`beforeClose`、`lockScroll`、safe-area props、imperative API、Web `teleport`、HTML 字符串和自定义 transition 名称。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Popup` 配置：

| Token             | 默认值                     | 说明               |
| ----------------- | -------------------------- | ------------------ |
| backgroundColor   | `colorBgContainer`         | 面板背景色         |
| overlayColor      | `colorBgMask`              | 遮罩背景色         |
| borderRadius      | `borderRadiusLG`           | `round` 使用的圆角 |
| animationDuration | `motionDurationMid * 1000` | 动画时长，单位毫秒 |
| zIndex            | `zIndexPopupBase`          | Popup 宿主默认层级 |

`theme.token.motion=false` 时动画时长强制为 `0`，但生命周期回调仍按打开/关闭顺序触发。`styles` 支持对象或函数；函数接收 `{ props, state: { visible, position, rendered } }`。
