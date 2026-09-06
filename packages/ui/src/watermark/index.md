---
title: Watermark 水印
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 展示组件
  order: 3
---

# Watermark 水印

<section className="component-doc-intro">

## 介绍

Watermark 用于在父容器中平铺文字或图片水印，可用于标识内容归属和防止信息盗用。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览" background="#f7f8fa"></code>

## 引入

```tsx | pure
import { ThemeProvider, Watermark } from '@ftsukic/react-native-ui'
```

`Watermark` 需要放在 `ThemeProvider` 内使用。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="文字水印" description="使用 content 添加文字水印。"></code>

<code src="./__fixtures__/examples/image.tsx" title="图片水印" description="使用 image 添加图片水印，图片优先于 content。"></code>

<code src="./__fixtures__/examples/geometry.tsx" title="间距与旋转" description="使用 width、height、gapX、gapY 和 rotate 调整水印单元。"></code>

<code src="./__fixtures__/examples/full-page.tsx" title="全屏范围" description="fullPage 使用父容器的 absoluteFill 布局。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题和语义样式" description="通过 Watermark token 和 root、canvas 语义样式定制水印。"></code>

## API

### Watermark Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 文字水印内容 | `string` | — |
| image | 图片水印内容；与 content 同时传入时优先使用图片 | `string \| ImageSourcePropType` | — |
| width | 单个水印单元的宽度，单位为 RN 逻辑像素 | `number` | `100` |
| height | 单个水印单元的高度，单位为 RN 逻辑像素 | `number` | `100` |
| gapX | 水印单元之间的水平间距 | `number` | `0` |
| gapY | 水印单元之间的垂直间距 | `number` | `0` |
| rotate | 水印旋转角度，单位为度 | `number` | `-22` |
| opacity | 水印整体透明度，限制在 `0~1` | `number` | — |
| textColor | 文字水印颜色 | `ColorValue` | `#dcdee0` |
| zIndex | 根节点层级 | `number` | 主题 `zIndexBase + 100` |
| fullPage | 是否使用父容器的 absoluteFill 范围 | `boolean` | `false` |
| style | 根 View 样式，优先级高于 `styles.root` | `StyleProp<ViewStyle>` | — |
| styles | 语义样式，支持 `root` 和 `canvas` | `WatermarkStyles` | — |

Watermark 继承 React Native `ViewProps`，但不接收 `children`；`style` 只作用于根 View。图片支持远程 URL、`require(...)` 和 RN `ImageSourcePropType`。

当 `content` 和 `image` 都没有有效内容时，组件不渲染节点。尺寸必须为正数，间距必须为非负数；非法值回退到默认值。水印根节点固定使用 `pointerEvents="none"`，不会阻止底层内容交互，也不会进入无障碍导航。

`fullPage` 不使用 Portal 或 Web fixed 定位。它只影响当前根 View 的 absoluteFill 布局；要覆盖整个屏幕，应将 Watermark 放在有屏幕尺寸的页面根容器中。

当前版本不提供 Vant 的 HTML `content` slot、ReactNode 自定义单元、`fontSize` 或 DOM/class API。

### 类型定义

```tsx | pure
import type {
  WatermarkImageSource,
  WatermarkMode,
  WatermarkProps,
  WatermarkSemanticStyles,
  WatermarkStyleInfo,
  WatermarkStyles,
  WatermarkStyleState,
} from '@ftsukic/react-native-ui'
```

## 语义样式

`styles` 可以传对象，也可以传函数。函数接收 `{ props, state }`，其中 `state.mode` 为 `text` 或 `image`。

```tsx | pure
<Watermark
  content="内部资料"
  styles={({ state }) => ({
    root: { opacity: state.mode === 'image' ? 0.65 : 0.8 },
  })}
/>
```

## 主题定制

通过 `ThemeProvider` 的 `theme.components.Watermark` 配置默认 token：

```tsx | pure
<ThemeProvider
  theme={{
    components: {
      Watermark: {
        textColor: '#7232dd',
        zIndex: 200,
      },
    },
  }}
>
  <Watermark content="主题水印" />
</ThemeProvider>
```

可覆盖的 token 为 `width`、`height`、`gapX`、`gapY`、`rotate`、`textColor`、`fontSize` 和 `zIndex`。
