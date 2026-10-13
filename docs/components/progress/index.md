---
title: Progress 进度条
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Progress 进度条

<section className="component-doc-intro">

## 介绍

Progress 用于展示任务完成进度，支持 Vant 风格的条形进度条和环形进度条。进度值会自动限制在 `0` 到 `100` 之间，并使用 Animated 平滑过渡更新。

</section>

<code src="../../../src/progress/__fixtures__/overview.tsx" title="组件预览" description="Progress 汇总条形、环形、文字、尺寸和主题 token 示例。"></code>

## 引入

```tsx | pure
import { Progress } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/progress/__fixtures__/examples/basic.tsx" title="默认条形" description="使用默认 token 渲染 60% 条形进度。"></code>

<code src="../../../src/progress/__fixtures__/examples/line-without-pivot.tsx" title="无文字条形" description="隐藏条形进度的 pivot 文字，仅显示轨道和进度部分。"></code>

<code src="../../../src/progress/__fixtures__/examples/line-variants.tsx" title="条形变体" description="展示 50%、100%、自定义颜色以及 round/square 端点。"></code>

<code src="../../../src/progress/__fixtures__/examples/circle.tsx" title="环形进度" description="展示默认尺寸、自定义尺寸和不同 strokeWidth 的环形进度。"></code>

<code src="../../../src/progress/__fixtures__/examples/circle-animation.tsx" title="环形动画" description="通过按钮更新环形进度，并观察描边和百分比文字平滑过渡。"></code>

<code src="../../../src/progress/__fixtures__/examples/custom-text.tsx" title="自定义文字" description="使用 pivotText 替换默认百分比文字。"></code>

<code src="../../../src/progress/__fixtures__/examples/dynamic.tsx" title="动态增减" description="使用 Button 组动态增加或减少当前进度。"></code>

<code src="../../../src/progress/__fixtures__/examples/theme.tsx" title="主题 token" description="通过 ConfigProvider 覆盖 Progress 的样式 token。"></code>

## API

### Progress

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| percentage | `number` | `0` | 当前进度，自动限制为 `0..100`；非有限数字按 `0` 处理 |
| type | `'line' \| 'circle'` | `'line'` | 条形或环形进度 |
| strokeWidth | `number` | line: `progress_height`；circle: `progress_circle_stroke_width` | 条形高度或环形描边宽度；无效值回退到 token |
| color | `ColorValue` | `progress_color` | 进度部分和环形进度颜色 |
| trackColor | `ColorValue` | `progress_track_color` | 条形轨道和环形背景颜色 |
| showPivot | `boolean` | `true` | 是否显示百分比或自定义 pivot 文字；环形模式显示在圆心 |
| pivotText | `ReactNode` | `\`${percentage}%\`` | 自定义 pivot 文字 |
| pivotColor | `ColorValue` | `progress_pivot_color` | 条形 pivot 的背景色；环形模式不渲染文字背景 |
| strokeLinecap | `'round' \| 'square'` | `'round'` | 进度端点形状；同时作用于条形和环形描边 |
| size | `number` | `progress_circle_size` | 环形直径；条形模式忽略此属性 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `ProgressStyles` | — | `root`、`rail`、`track`、`indicatorContainer`、`body`、`indicator` 语义样式；支持对象或函数。 |

Progress 继承 React Native `ViewProps`，但由组件管理 `children`、`style`、`accessibilityRole` 和 `accessibilityValue`。根节点使用 `progressbar` 语义，并将 `min`、`max`、`now` 分别设置为 `0`、`100` 和归一化后的 percentage。

`style` 只作用于根 View。`styles` 可以传入语义样式对象，也可以传入接收 `{ props, state }` 的 resolver 函数；可用插槽为 `root`、`body`、`rail`、`track`、`indicator` 和 `indicatorContainer`。组件不提供 `disabled`、`loading`、children 进度内容、Web DOM 属性或自定义 SVG path API。

| 插槽               | 实际节点与职责                                              | 适用模式      |
| ------------------ | ----------------------------------------------------------- | ------------- |
| root               | 根 View，整体布局；`style` 优先于 `styles.root`             | line / circle |
| rail               | 背景轨道 View                                               | line          |
| track              | 已完成部分 View；宽度由进度动画管理                         | line          |
| body               | 包含 SVG 圆环和中心标签的 View                              | circle        |
| indicatorContainer | 标签容器 View；条形负责背景与进度定位，环形负责中心文字布局 | line / circle |
| indicator          | 自动生成的 Text，负责文字颜色、字号和字重                   | line / circle |

条形节点为 `root → rail → track / indicatorContainer → indicator`；环形节点为 `root → body → Svg / indicatorContainer → indicator`，SVG 内部两个 Circle 不作为样式插槽公开。条形标签根据轨道和标签的实际宽度限制位置，避免在 0% 和 100% 时越界；其定位和 transform 由组件管理。自定义 `pivotText` ReactNode 的内部样式由调用方设置，`indicatorContainer` 仍作用于其外层容器；标签区域使用 `pointerEvents="none"`，用于展示内容。

动画时长遵循 `theme.motion` 的 enabled、reducedMotion 和 durationScale 配置；关闭动画时直接显示目标值。`color` 和 `trackColor` 支持 React Native 原生颜色对象。

条形结构为 `Progress → track → portion`，根节点宽度为 `100%`。首次渲染直接显示当前值；percentage 更新时使用组件 token 中的动画时长和 `Easing.out(Easing.cubic)` 平滑过渡。`strokeLinecap="round"` 使用进度高度的一半作为圆角，`square` 使用直角。环形模式使用 `react-native-svg` 的两个 `Circle`，从顶部开始顺时针绘制，不依赖额外 SVG path 库。

## Token

通过 `ConfigProvider` 的 `theme.components.Progress` 覆盖默认 token：

| Token                          | 默认来源             | 说明                            |
| ------------------------------ | -------------------- | ------------------------------- |
| `progress_height`              | `4`                  | 条形进度高度                    |
| `progress_track_color`         | `colorFillSecondary` | 轨道颜色                        |
| `progress_color`               | `colorPrimary`       | 进度颜色                        |
| `progress_circle_size`         | `controlHeight`      | 环形默认尺寸                    |
| `progress_circle_stroke_width` | `4`                  | 环形默认描边宽度                |
| `progress_pivot_font_size`     | `fontSizeSM`         | pivot 文字字号                  |
| `progress_pivot_color`         | `colorPrimary`       | 条形 pivot 背景色               |
| `progress_animation_duration`  | `300`                | percentage 更新动画时长（毫秒） |

```tsx | pure
import { ConfigProvider, Progress } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    components: {
      Progress: {
        progress_color: '#7232DD',
        progress_height: 8,
        progress_track_color: '#F0E8FF',
      },
    },
  }}
>
  <Progress percentage={72} />
</ConfigProvider>
```
