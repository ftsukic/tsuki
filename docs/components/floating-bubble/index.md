---
title: FloatingBubble 悬浮气泡
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# FloatingBubble 悬浮气泡

<section className="component-doc-intro">

## 介绍

FloatingBubble 是一个通过 Portal 挂载到视口层的悬浮操作气泡，默认位于右下区域，支持拖动、方向限制、边界磁吸、安全区和受控位置。

</section>

<code src="../../../src/floating-bubble/__fixtures__/overview.tsx" title="组件预览" description="FloatingBubble 的定位、拖动、磁吸、受控、自定义内容、安全区和主题预览。"></code>

## 引入

```tsx | pure
import { FloatingBubble, Icon } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/floating-bubble/__fixtures__/examples/basic.tsx" title="基础用法" description="默认右下定位和点击反馈。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/axis.tsx" title="拖动方向" description="展示横向、纵向、自由拖动和锁定。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/magnetic.tsx" title="横向磁吸" description="松手吸附到最近的左右边界。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/controlled.tsx" title="受控位置" description="使用 offset 和 onOffsetChange 持有最终坐标。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/custom.tsx" title="自定义内容" description="使用 children 和自定义尺寸。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/safe-area.tsx" title="安全区" description="避开顶部和底部系统安全区。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/theme.tsx" title="主题定制" description="覆盖 FloatingBubble token 和 semantic styles。"></code>

## API

### FloatingBubble

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 气泡内容，可以是任意 ReactNode |
| icon | `ReactNode` | — | 便利图标内容；`children` 传入时优先使用 `children` |
| axis | `'x' \| 'y' \| 'xy' \| 'lock'` | `'y'` | `x` 只横向拖动，`y` 只纵向拖动，`xy` 自由拖动，`lock` 禁止拖动但仍可点击 |
| magnetic | `'x' \| 'y'` | — | 松手后吸附到对应轴上最近的边界；不改变另一轴 |
| gap | `number` | `24` | 气泡与可用 viewport 边界的最小距离，优先于 token |
| offset | `FloatingBubbleOffset` | — | 受控的 viewport 左上角坐标，表示气泡左上角位置 |
| defaultOffset | `FloatingBubbleOffset` | 右下边界 | 非受控模式的初始坐标 |
| onOffsetChange | `(offset) => void` | — | 一次拖动或磁吸完成后通知最终坐标，不会逐帧触发 |
| onOffsetChangeEnd | `(offset) => void` | — | 拖动/磁吸最终位置完成后通知 |
| safeAreaInsetTop | `boolean` | `true` | 是否将顶部 safe-area inset 加入可移动边界 |
| safeAreaInsetBottom | `boolean` | `true` | 是否将底部 safe-area inset 加入可移动边界 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式；优先级高于默认样式和 `styles.root` |
| styles | `FloatingBubbleStyles` | — | `root`、`content`、`icon` 语义样式；函数可读取 `{ props, state: { dragging } }` |

组件继承 React Native `PressableProps`，但自行管理 `children` 和 `style`；`disabled` 会同时禁用点击和拖动，`accessibilityRole` 默认是 `button`。图标型气泡应提供 `accessibilityLabel`：

```tsx | pure
<FloatingBubble accessibilityLabel="打开客服" onPress={openSupport}>
  <Icon name="CustomerServiceOutlined" size={24} />
</FloatingBubble>
```

气泡位置使用 viewport 左上角坐标系。组件会根据 viewport、真实 bubble layout、`gap` 和 safe-area 计算边界，并对 `offset`、`defaultOffset` 和拖动结果统一 clamp；容器很小时会退化为单一合法位置。viewport 尺寸变化、旋转或气泡尺寸变化后会重新 clamp。

### 受控模式

传入 `offset` 后，父组件持有位置。拖动视觉位置由 UI thread 更新，结束时才调用 `onOffsetChange` 和 `onOffsetChangeEnd`；父组件可以在回调中写回新的 `offset`，不会形成逐帧回路。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.FloatingBubble` 覆盖 token：

`size`、`iconSize`、`backgroundColor`、`color`、`borderRadius`、`gap`、`zIndex`、`shadowColor`、`shadowOpacity`、`shadowRadius`、`shadowOffset`、`elevation`、`animationDuration` 和 `pressedOpacity`。

`gap` prop 未传入时才使用 `FloatingBubble.gap` token。`styles.root`、`styles.content` 和 `styles.icon` 用于局部语义覆盖。

### Portal 行为与边界

FloatingBubble 通过现有 `Portal` 挂载到最近的 `Portal.Host`，外层是 `absoluteFill` 且 `pointerEvents="box-none"`，只有气泡本身参与 hit testing，不会阻塞页面其他区域。

组件不提供 Vant Web 专属的 teleport、DOM API、CSS 定位或 HTML 属性；位置统一使用 `offset`/`defaultOffset`，内容通过 React Native children 自定义。
