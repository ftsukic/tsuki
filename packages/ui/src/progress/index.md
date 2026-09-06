---
title: Progress 进度
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Progress 进度

<section className="component-doc-intro">

## 介绍

Progress 用于展示任务的当前完成进度，支持横向进度条和环形进度。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Progress } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="默认使用横向进度条，circle 类型展示环形进度。"></code>

<code src="./__fixtures__/examples/boundaries.tsx" title="边界值" description="百分比会限制在 0 到 100 之间。"></code>

<code src="./__fixtures__/examples/format.tsx" title="自定义提示" description="通过 format 自定义提示，showInfo 可以隐藏提示。"></code>

<code src="./__fixtures__/examples/dynamic.tsx" title="动态更新" description="percent 更新时进度线和圆环会平滑过渡。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题和语义样式" description="通过 Progress token 和 styles 定制组件。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'line' \| 'circle'` | `'line'` | 进度展示类型 |
| percent | `number` | `0` | 完成百分比；非有限值按 `0` 处理，并限制在 `0~100` |
| size | `number` | `100` | 圆环直径，单位为 RN 逻辑像素；仅 `circle` 生效 |
| strokeWidth | `number` | line `4`，circle `6` | 进度线宽度，单位为 RN 逻辑像素 |
| strokeColor | `ColorValue` | 主题主色 | 已完成进度颜色 |
| trailColor | `ColorValue` | 主题次级填充色 | 未完成轨道颜色 |
| showInfo | `boolean` | `true` | 是否显示百分比或 `format` 返回的内容 |
| format | `(percent: number) => ReactNode` | `percent => \`${percent}%\`` | 自定义提示内容；传入的值已经完成边界归一化 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于 `styles.root` |
| styles | `ProgressStyles` | — | `root / body / rail / track / indicator / text` 语义样式 |

Progress 继承 React Native `ViewProps`，但不接收 `children`；`style` 始终只作用于根 View。line 默认占满父容器宽度，circle 默认从 12 点方向顺时针绘制，进度变化使用平滑过渡。

根节点暴露 `progressbar` 无障碍语义和 `min / max / now` 进度值。`showInfo` 关闭时仍保留无障碍进度值。

`styles` 支持对象或函数，函数接收 `{ props, state: { type, percent } }`。`rail` 和 `track` 可分别定制 line 轨道与进度层，也可定制 circle 对应的 SVG 容器；circle 的线宽和颜色通过 `strokeWidth / strokeColor / trailColor` 控制。

可通过 `ThemeProvider` 的 `theme.components.Progress` 配置 `defaultColor / railColor / textColor / textSize / gap / lineStrokeWidth / circleStrokeWidth / circleSize / borderRadius / duration`。

当前版本不提供 `status`、`success`、`dashboard`、`steps`、渐变色、拖拽交互，也不保留 Vant 的 `percentage`、`pivotText` 等命名别名。组件依赖宿主提供的 `react-native-svg` peer dependency；H5 预览不代表原生平台运行验证。
