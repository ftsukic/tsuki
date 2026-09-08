---
title: Empty 空状态
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Empty 空状态

<section className="component-doc-intro">

## 介绍

Empty 用于在列表、页面或内容区域没有可展示数据时提供统一的空状态反馈。默认图片使用项目内置的 Vant 默认空状态插画，不依赖网络或 Icon。

</section>

<code src="../../../src/empty/__fixtures__/overview.tsx" title="组件预览" description="Empty 汇总默认图片、描述、操作区、自定义图片和主题定制示例。"></code>

## 引入

```tsx | pure
import { Button, Empty, Text } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/empty/__fixtures__/examples/basic.tsx" title="默认 Empty" description="使用本地 Vant 默认空状态插画，不依赖网络或 Icon。"></code>

<code src="../../../src/empty/__fixtures__/examples/custom-description.tsx" title="自定义 description" description="description 支持自定义 ReactNode。"></code>

<code src="../../../src/empty/__fixtures__/examples/custom-image.tsx" title="自定义 image" description="image 支持自定义 ReactNode，imageSize 可调整容器尺寸。"></code>

<code src="../../../src/empty/__fixtures__/examples/action.tsx" title="带 Button 操作" description="children 会渲染在只负责间距布局的底部操作区域。"></code>

<code src="../../../src/empty/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Empty component token 调整图片尺寸、描述文字和底部间距。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| image | `ReactNode \| string` | 内置 Vant 图片 | 自定义图片节点或图片 URL 字符串；字符串使用 RN `Image` 渲染 |
| imageSize | `number \| string` | `160` | 图片容器的宽高；数字使用 RN 逻辑像素，RN 支持百分比字符串，Web 另外支持 Vant CSS 单位 |
| description | `ReactNode` | — | 空状态说明；字符串和数字使用库内 `Text` 渲染，自定义节点原样渲染 |
| children | `ReactNode` | — | 底部操作区域内容，Empty 只负责布局间距，不绑定 Button |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |

Empty 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。根布局为纵向排列并水平居中，说明文本默认居中。图片容器使用 `accessibilityRole="image"`，字符串图片本身也使用图片语义；默认图片来自 `assets/empty/empty.svg` 的本地 Vant illustration，字符串图片仅接收地址，不会由组件发起额外资源下载。

`style` 只作用于根 View；组件不提供 `styles` 语义样式 API，也不接收 Vant 的 `image` 预设名称（如 `error`、`network`、`search`），需要自定义预设时请传入 ReactNode 或图片地址。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Empty` 覆盖尺寸、说明文字和操作间距。

可覆盖的 Empty token：

| Token                                  | 默认来源             | 说明               |
| -------------------------------------- | -------------------- | ------------------ |
| `empty_image_size`                     | `160`                | 默认图片尺寸       |
| `empty_description_margin_top`         | `margin`             | 图片与说明的间距   |
| `empty_description_padding_horizontal` | `60`                 | 说明文字水平内边距 |
| `empty_description_color`              | `colorTextSecondary` | 说明文字颜色       |
| `empty_description_font_size`          | `fontSize`           | 说明文字字号       |
| `empty_footer_margin_top`              | `24`                 | 说明与操作区的间距 |
