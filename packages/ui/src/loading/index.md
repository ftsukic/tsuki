---
title: Loading 加载
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Loading 加载

<section className="component-doc-intro">

## 介绍

加载用于指示内容正在处理，支持圆环、菊花两种指示器，以及行内提示、纵向布局和区域遮罩加载。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Button, ThemeProvider, Loading } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/types.tsx" title="指示器类型" description="type 控制圆环或菊花指示器。"></code>

<code src="./__fixtures__/examples/text.tsx" title="提示文案" description="通过 text 和 vertical 组合指示器与提示文案。"></code>

<code src="./__fixtures__/examples/area.tsx" title="区域加载" description="传入 children 后覆盖当前区域，delay 可避免短请求闪烁。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'circular' \| 'spinner'` | `'circular'` | 圆环或十二条辐射线菊花 |
| size | `number` | `30` | 指示器尺寸，RN 逻辑像素 |
| color | `ColorValue` | 主题主色 | 指示器颜色 |
| text | `ReactNode` | — | 提示文案；自定义节点自行控制文本样式 |
| textSize | `number` | 主题字号 | 提示文字尺寸 |
| textColor | `ColorValue` | 主题次级文本色 | 提示文字颜色 |
| vertical | `boolean` | `false` | 指示器与提示是否纵向排列 |
| spinning | `boolean` | `true` | 是否加载；关闭后停止并清理动画 |
| delay | `number` | `0` | 延迟显示毫秒数，期间结束则不显示；期间内容可操作 |
| duration | `number` | `900` | 每圈动画毫秒数 |
| children | `ReactNode` | — | 被覆盖的区域内容，始终保持挂载 |
| styles | `LoadingStyles` | — | `root / indicator / text / container / mask` 语义样式 |
| style | `StyleProp<ViewStyle>` | — | 根节点样式，优先于 `styles.root` |

继承 `ViewProps` 并转发根 View ref。无区域内容且未显示加载时不渲染节点。区域加载显示时降低内容透明度，阻止内容触摸，并从无障碍导航中隐藏内容；加载指示器暴露 `progressbar` 和 `busy` 状态。遮罩只覆盖当前区域，不提供全屏或百分比进度。

`styles` 支持对象或函数，函数接收 `{ props, state: { spinning, nested } }`，其中 `spinning` 为延迟处理后的实际显示状态。布局使用 React Native View，SVG 配合 Animated 旋转；Native Runtime 使用原生动画，H5 预览使用 JS 动画循环。

可通过 `ThemeProvider theme.components.Loading` 配置 `size / color / textColor / textSize / gap / duration / contentOpacity / minHeight`。默认间距来自主题 `paddingXS`，加载内容透明度为 `0.4`，加载期间最小内容高度为 `80`。非正或非有限 `size / duration` 回退到组件 token；负数或非有限 `delay` 按 `0` 处理。

迁移：`LoadingIcon` 和 `LoadingIconProps` 已移除，改用 `Loading` 和 `LoadingProps`。`active` 改为 `spinning`，值为 `false` 时隐藏指示器；`size / color / duration` 不再必填。提示使用 `text`，`children` 专用于区域内容。
