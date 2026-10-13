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

FloatingBubble 是一个通过 Portal 挂载到宿主浮层区域的悬浮操作气泡，默认位于右下区域，支持拖动、方向限制、边界磁吸、安全区和受控位置。

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

<code src="../../../src/floating-bubble/__fixtures__/examples/semantic.tsx" title="语义样式" description="分别定制气泡、内容和图标区域，以及拖动状态。"></code>

<code src="../../../src/floating-bubble/__fixtures__/examples/motion.tsx" title="动画策略" description="统一控制按压反馈和磁吸动画。"></code>

## API

### FloatingBubble

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 气泡内容；传入时优先于 icon，`null` 表示空内容。文字需放入 Text |
| icon | `ReactNode` | — | 便利图标内容；直接传入的 Tsuki Icon 使用气泡颜色和尺寸 token，显式 Icon props 优先 |
| axis | `'x' \| 'y' \| 'xy' \| 'lock'` | `'y'` | `x` 只横向拖动，`y` 只纵向拖动，`xy` 自由拖动，`lock` 禁止拖动但仍可点击 |
| magnetic | `'x' \| 'y'` | — | 松手后吸附到对应轴上最近的边界；不改变另一轴 |
| gap | `number` | `24` | 气泡拖动及最终定位到 Host 可用区域边界的间距，优先于 token；回弹可短暂进入间距区域 |
| offset | `FloatingBubbleOffset` | — | 受控的 Portal.Host 可用区域左上角坐标，表示气泡左上角位置 |
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

气泡位置使用最近 Portal.Host 可用区域的左上角坐标系；全屏 Host 下与 viewport 坐标一致。组件会测量实际 Portal 层和 bubble layout，根据 `gap` 和 safe-area 计算边界，并对 `offset`、`defaultOffset` 和拖动结果统一 clamp；容器很小时会退化为单一合法位置。Host 区域尺寸变化、旋转或气泡尺寸变化后会重新 clamp。

首次测量并完成定位前，气泡透明、不参与交互，并从无障碍树隐藏；定位后恢复调用方的交互和无障碍配置。

### 语义结构

`style` 和 `styles.root` 作用于根 Pressable，`style` 优先；组件保留位置 transform，坐标由 `offset`/`defaultOffset` 管理。`styles.content` 作用于内容 View；`styles.icon` 只在未传入 children、使用 icon prop 时作用于图标区域 View。放在 children 中的 Icon 不会使用 icon 槽。

`styles` 函数可以读取 `state.dragging`，该值只表示正在拖动，松手后的磁吸阶段为 false。Portal 定位层和手势节点是内部结构，不提供公共样式槽。

### 受控模式

传入 `offset` 后，父组件持有位置。拖动视觉位置由 UI thread 更新，结束时才调用 `onOffsetChange` 和 `onOffsetChangeEnd`；父组件可以在回调中写回新的 `offset`，不会形成逐帧回路。

父组件忽略请求时恢复受控位置，写回目标时保留新位置。外部 offset 更新和边界变化会取消旧拖动/磁吸并直接重新定位，不额外通知位置变更。

### 动画与中断

磁吸采用快速靠边、轻微回弹的 spring，并接续吸附轴的松手速度；过大的速度会被限制，回弹视觉位置不会越过可用区域的安全边界。只吸附对应轴，不改变另一轴。

磁吸和按压反馈遵循 Provider 的 `motion`（或 ConfigProvider 的 `theme.motion`）：`enabled`、`reducedMotion` 和 `durationScale`，以及 `theme.seed.motion`。保留 `animationDuration` token，以 300ms 为 spring 的基准速度配置：增大时减慢、减小时加快，不表示精确结束时刻。关闭动画、要求减弱动态、时长或倍率为零时立即到达目标。

再次开始拖动会取消两轴磁吸，并从当前位置接续。磁吸完成后才调用两个位置回调，各一次；被新拖动、外部位置/边界更新、禁用、锁定或卸载打断的旧磁吸不会再通知。拖动被取消，或拖动中禁用/锁定时，提交当前已移动的位置并清理拖动状态，不再磁吸。切换拖动轴、磁吸轴或动画策略也会取消当前 session。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.FloatingBubble` 覆盖 token：

`size`、`iconSize`、`backgroundColor`、`color`、`borderRadius`、`gap`、`zIndex`、`shadowColor`、`shadowOpacity`、`shadowRadius`、`shadowOffset`、`elevation`、`animationDuration` 和 `pressedOpacity`。

`gap` prop 未传入时才使用 `FloatingBubble.gap` token。`styles.root`、`styles.content` 和 `styles.icon` 用于局部语义覆盖。

`color` 和 `iconSize` 为直接通过 icon prop 传入的 Tsuki Icon 提供默认 color/size；Icon 显式 props 优先。`iconSize` 也控制图标区域的默认尺寸。自定义节点和 children 不会被递归改写，文字颜色由调用方设置。

### Portal 行为与边界

FloatingBubble 通过现有 `Portal` 挂载到最近的 `Portal.Host`，外层是 `absoluteFill` 且 `pointerEvents="box-none"`，只有气泡本身参与 hit testing，不会阻塞页面其他区域。

页面内的常驻气泡应使用页面级 Host，让气泡随页面转场。导航页面失焦但被保留时，宿主应用还需卸载气泡；需要恢复全局命令式浮层归属时，也应卸载该页面的 Host。Example 对 FloatingBubble 和 FloatingPanel 使用这一策略，重新进入页面时重建预览。

组件不提供 Vant Web 专属的 teleport、DOM API、CSS 定位或 HTML 属性；位置统一使用 `offset`/`defaultOffset`，内容通过 React Native children 自定义。
