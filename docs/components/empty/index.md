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
| imageAccessibilityLabel | `string` | — | 内置插画和 URL 图片的可访问性标签；不传时按装饰图处理，自定义节点自行提供语义 |
| imageSize | `number \| string` | `160` | 图片容器的宽高；数字使用 RN 逻辑像素，RN 支持百分比字符串，Web 另外支持 Vant CSS 单位 |
| description | `ReactNode` | — | 空状态说明；字符串、数字和 bigint 使用库内 `Text` 渲染，自定义节点原样渲染 |
| children | `ReactNode` | — | 底部操作区域内容；字符串和数字自动包裹 `Text`，自定义节点原样渲染，不绑定 Button |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先于 `styles.root` |
| styles | `EmptyStyles` | — | 语义样式对象或接收 `{ props, state }` 的函数 |

Empty 继承 React Native `ViewProps`，透传到根 View；`accessibilityLabel` 描述根节点，不替代图片标签。根布局为纵向排列并水平居中，自动生成的说明文本默认居中。默认图片来自 `assets/empty/empty.svg` 的本地 Vant illustration，URL 图片由 RN `Image` 加载。

内置插画和 URL 图片默认按装饰图处理，从可访问性树隐藏。设置非空 `imageAccessibilityLabel` 后，仅图片容器提供一个带标签的 `image` 节点。自定义图片不强制添加 role，也不隐藏其后代；调用方在自定义节点上设置标签、角色和交互语义，`imageAccessibilityLabel` 不作用于自定义节点。根节点不默认设置 `accessible`，操作按钮保留自身可访问性。

`image={null}`、`image={false}` 或 `image=""` 隐藏图片区；省略 `image` 使用默认插画。数字图片节点会包裹 `Text`。操作内容及自定义说明数组中的字符串、数字自动包裹 `Text`；自定义组件内部的文本结构仍由调用方负责。组件不接收 Vant 的 `image` 预设名称（如 `error`、`network`、`search`），需要自定义预设时请传入 ReactNode 或图片地址。

## 语义结构与样式

```text
root
├── image
├── descriptionContainer
│   └── description（自动生成的 Text）
└── footer
```

| 槽位 | 类型 | 作用 |
| --- | --- | --- |
| root | `StyleProp<ViewStyle>` | 根 View，整体布局和外观 |
| image | `StyleProp<ViewStyle>` | 图片容器，尺寸和布局，不是内部 Image/SVG |
| descriptionContainer | `StyleProp<ViewStyle>` | 说明区域的间距和内边距 |
| description | `StyleProp<TextStyle>` | 仅作用于直接传入字符串、数字或 bigint 时自动生成的说明 Text |
| footer | `StyleProp<ViewStyle>` | 操作区域的间距和排列 |

优先级为 token 派生默认样式 → `styles` → 根 `style`。自定义 ReactNode 的内部样式由调用方负责；`styles.description` 不修改自定义节点。说明的默认行高按主题字号与行高比例派生，随 `empty_description_font_size` 同步变化；显式覆盖字号时可通过 `styles.description.lineHeight` 配套调整。

样式函数的 state 提供 `hasImage`、`hasDescription`、`hasAction`，分别表示是否启用对应区域；不检测自定义组件最终是否返回 null。

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
