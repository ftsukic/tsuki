---
title: WaterMark 水印
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# WaterMark 水印

<section className="component-doc-intro">

## 介绍

WaterMark 在父容器内平铺不可点击的文字水印，支持间距、偏移、旋转、透明度和前景层渲染。`water-mark` 是历史命名入口，推荐使用 `watermark` 文档和导出。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="文字水印" description="使用 text 添加覆盖父容器的平铺水印。"></code>

## 引入

```tsx | pure
import { WaterMark } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `text` | 水印文本 | `string` | 必填 |
| `color` / `fontSize` / `opacity` | 文本颜色、字号和透明度 | `ColorValue` / `number` | 主题值 |
| `width` / `height` | 单个水印单元尺寸 | `number` | 自动 / `64` |
| `gap` | 水平和垂直单元间距 | `readonly [number, number]` | 主题值 |
| `offset` | 水印图案的水平和垂直偏移 | `readonly [number, number]` | 主题值 |
| `rotate` | 旋转角度 | `number` | `-45` |
| `foreground` | 是否将水印绘制在 children 前景 | `boolean` | `false` |
| `style` / `children` | 根容器样式和内容 | `StyleProp<ViewStyle>` / `ReactNode` | — |
| `theme` | 覆盖 WaterMark token | `Partial<WaterMarkToken>` | — |

WaterMark 继承 React Native `ViewProps`，根容器默认 `flex: 1` 且 `overflow: hidden`；水印图层设置 `pointerEvents="none"`，不会拦截子内容触摸。`textWidth` 和 `textHeight` 已废弃，请改用 `width` 和 `height`。组件没有 `styles` 语义 slot。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
