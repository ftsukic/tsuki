---
title: FloatingPanel 浮动面板
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# FloatingPanel 浮动面板

<section className="component-doc-intro">

## 介绍

FloatingPanel 用于在视口底部展示可拖动面板，支持多个高度锚点、磁吸停靠、内容滚动和底部安全区适配。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { FloatingPanel, Provider } from '@ftsukic/react-native-ui'
```

FloatingPanel 使用 Portal，推荐挂载在应用根节点的 `Provider` 内：

```tsx | pure
<Provider>
  <App />
</Provider>
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="默认从 100px 高度开始，拖动 header 浏览内容。"></code>

<code src="./__fixtures__/examples/anchors.tsx" title="自定义锚点" description="使用 height、anchors 和两个高度事件控制面板。"></code>

<code src="./__fixtures__/examples/content-draggable.tsx" title="仅拖动头部" description="关闭 contentDraggable 后，内容区域继续由 ScrollView 负责滚动。"></code>

<code src="./__fixtures__/examples/magnetic.tsx" title="关闭磁吸" description="magnetic=false 时停留在边界内的任意高度。"></code>

<code src="./__fixtures__/examples/disabled.tsx" title="禁用拖动" description="draggable=false 隐藏拖拽条并固定面板。"></code>

<code src="./__fixtures__/examples/safe-area.tsx" title="底部安全区" description="默认适配底部 safe-area inset，并且不改变锚点高度。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 FloatingPanel token 和 semantic styles 定制外观。"></code>

## API

### FloatingPanelProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `height` | `number` | — | 受控当前高度，单位为 RN 逻辑像素 |
| `defaultHeight` | `number` | 第一个锚点 | 非受控初始高度 |
| `anchors` | `readonly number[]` | `[100, windowHeight * 0.6]` | 高度锚点；无效值会被过滤并按升序处理 |
| `duration` | `number` | 主题 `animationDuration` | 吸附动画时长，单位为毫秒 |
| `magnetic` | `boolean` | `true` | 松手后是否吸附到最近锚点 |
| `draggable` | `boolean` | `true` | 是否允许拖动；关闭时隐藏默认拖拽条 |
| `contentDraggable` | `boolean` | `true` | 是否允许从内容区域拖动面板 |
| `safeAreaInsetBottom` | `boolean` | `true` | 是否把底部 safe-area inset 加入内容 padding |
| `header` | `ReactNode` | 默认拖拽条 | 自定义面板头部 |
| `onHeightChange` | `(height: number) => void` | — | 拖动过程和最终收敛时持续同步高度 |
| `onHeightChangeEnd` | `(height: number) => void` | — | 松手完成吸附或边界收敛后触发 |
| `style` | `StyleProp<ViewStyle>` | — | 面板 root 样式 |
| `styles` | `FloatingPanelStyles` | — | `root / header / bar / content / contentContainer` 语义样式 |

组件继承 React Native `ViewProps`，除 `children` 和 `style` 外透传到面板 root；ref 指向面板 root。所有高度使用 RN 逻辑像素，`duration` 使用毫秒。

`height` 存在时为受控模式，父组件应在 `onHeightChange` 中回写高度；未传入时使用 `defaultHeight` 作为非受控初始值。拖动越过边界时会按 Vant 的阻尼规则暂时显示越界高度，松手后的吸附或边界收敛高度始终位于最小和最大锚点之间。`onHeightChangeEnd` 在收敛动画完成后触发；`duration={0}` 或主题关闭 motion 时立即触发。`anchors` 少于两个有效值时，会补充默认最大高度。

面板内部使用 `ScrollView`。当面板尚未达到最大高度时，内容垂直手势优先拖动面板；面板达到最大高度后，内容向上滚动交给 `ScrollView`，内容位于顶部并向下拖动时重新接管面板。`contentDraggable={false}` 时只有 header 拖动，内容仍可滚动。

`styles` 支持对象或函数，函数接收 `{ props, state: { height, minHeight, maxHeight, dragging } }`。`style` 与 `styles.root` 作用于面板 root，`styles.contentContainer` 作用于内部 `ScrollView` 内容容器。

组件没有遮罩，不会阻止面板外部页面交互；不提供 Web 专用的 `lockScroll`、`teleport` 或 imperative API。

### 无障碍与平台说明

FloatingPanel 不替换 children 的无障碍语义；交互内容应自行提供 `accessible`、`accessibilityRole` 和 `accessibilityLabel`。默认拖拽条是视觉手柄，拖拽能力通过触摸手势提供。组件直接读取 `react-native-safe-area-context` 的 inset；宿主应用需要安装该 peer dependency，并在 `Provider` 外层或应用根节点挂载 `SafeAreaProvider`。

H5 文档使用 `react-native-web` 预览；Jest 只验证状态、样式和 responder 逻辑，不代表 iOS、Android 或 HarmonyOS 的真实设备触摸表现。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.FloatingPanel` 配置：

| Token               | 默认值                      | 说明                     |
| ------------------- | --------------------------- | ------------------------ |
| `borderRadius`      | `16`                        | 顶部左右圆角             |
| `headerHeight`      | `30`                        | 默认 header 高度         |
| `zIndex`            | `zIndexPopupBase - 1`       | Portal 层级              |
| `backgroundColor`   | `colorBgElevated`           | 面板背景                 |
| `barWidth`          | `20`                        | 拖拽条宽度               |
| `barHeight`         | `3`                         | 拖拽条高度               |
| `barColor`          | `colorTextQuaternary`       | 拖拽条颜色               |
| `animationDuration` | `motionDurationSlow * 1000` | 吸附动画时长，单位为毫秒 |
