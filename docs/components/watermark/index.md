---
title: Watermark 水印
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Watermark 水印

<section className="component-doc-intro">

## 介绍

Watermark 用于在组件自身的布局区域上重复覆盖文字或图片水印。它不使用 Portal，水印层不拦截触摸，也不会把重复文字加入无障碍树。

</section>

<code src="../../../src/watermark/__fixtures__/overview.tsx" title="组件预览" description="Watermark 汇总文字、图片、布局、语义样式和主题 token 示例。"></code>

## 引入

```tsx | pure
import { Watermark } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/watermark/__fixtures__/examples/basic.tsx" title="基础文字" description="展示默认文字平铺和触摸穿透。"></code>

<code src="../../../src/watermark/__fixtures__/examples/multiline.tsx" title="多行文字" description="数组内容在同一个水印块中按多行渲染。"></code>

<code src="../../../src/watermark/__fixtures__/examples/image.tsx" title="图片水印" description="使用 RN ImageSource 和 contain 模式渲染图片水印。"></code>

<code src="../../../src/watermark/__fixtures__/examples/layout.tsx" title="间距、旋转和偏移" description="调整水印块尺寸、两轴间距、起始偏移、旋转和透明度。"></code>

<code src="../../../src/watermark/__fixtures__/examples/custom.tsx" title="语义样式" description="通过 styles.root、styles.mark 和 styles.text 定制外观。"></code>

<code src="../../../src/watermark/__fixtures__/examples/theme.tsx" title="主题 token" description="通过 ConfigProvider 覆盖 Watermark component token。"></code>

## API

### Watermark

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 需要被水印覆盖的局部内容 |
| content | `string \| string[]` | — | 水印文字；数组表示一个水印块中的多行文字，不是多个独立内容 |
| image | `ImageSourcePropType` | — | 图片水印；存在时优先于 `content` |
| width | `number` | `100` | 单个水印内容区域的宽度；非有限或非正值回退到 token |
| height | `number` | `100` | 单个水印内容区域的高度；非有限或非正值回退到 token |
| gapX | `number` | `24` | 水印块之间的横向间距；负值按 `0` 处理 |
| gapY | `number` | `48` | 水印块之间的纵向间距；负值按 `0` 处理 |
| offsetX | `number` | `0` | 整个水印网格相对左上角的横向起始偏移 |
| offsetY | `number` | `0` | 整个水印网格相对左上角的纵向起始偏移 |
| rotate | `number` | `-22` | 单个水印块的旋转角度，单位为 degree；不会旋转整个 overlay |
| opacity | `number` | `0.15` | 单个水印块透明度，限制在 `0..1` |
| zIndex | `number` | `1` | 局部 overlay 的层级，不是全局浮层层级 |
| imageResizeMode | `ImageResizeMode` | `'contain'` | 图片的 RN 缩放模式 |
| style | `StyleProp<ViewStyle>` | — | 仅作用于根 View，优先级高于默认样式和 `styles.root` |
| styles | `WatermarkStyles` | — | 语义样式对象或 resolver 函数 |

Watermark 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。`image` 存在时，`content` 不渲染；两者都未设置时仍会渲染 children，但不会创建水印 tile。组件使用 Native View 的绝对定位网格，单个 tile 默认额外渲染边界行列，并将极端配置限制在有限数量内。

`content={['Tsuki', 'Confidential']}` 等价于在一个水印块中显示两行居中文字。Watermark 不支持 arbitrary `ReactNode` 水印内容、点击回调、动画、Canvas、SVG Pattern、DOM 字体 API、远程图片生命周期或 downloadable canvas。

### WatermarkStyles

`styles` 可以是对象，也可以是接收 `{ props, state }` 的 resolver 函数。`state` 只包含 `hasContent` 和 `hasImage`。可用语义插槽如下：

| 插槽    | 类型                    | 作用           |
| ------- | ----------------------- | -------------- |
| root    | `StyleProp<ViewStyle>`  | 根 View        |
| overlay | `StyleProp<ViewStyle>`  | 覆盖层         |
| mark    | `StyleProp<ViewStyle>`  | 每个重复水印块 |
| text    | `StyleProp<TextStyle>`  | 文字水印       |
| image   | `StyleProp<ImageStyle>` | 图片水印       |

样式优先级为内部默认样式 → semantic styles → `style`（仅 root）。组件不提供 `textStyle`、`imageStyle` 或 `containerStyle` 别名。

### WatermarkToken

通过 `ConfigProvider` 的 `theme.components.Watermark` 覆盖默认 token：

| Token      | 默认值               | 说明              |
| ---------- | -------------------- | ----------------- |
| width      | `100`                | 单个水印块宽度    |
| height     | `100`                | 单个水印块高度    |
| gapX       | `24`                 | 横向间距          |
| gapY       | `48`                 | 纵向间距          |
| rotate     | `-22`                | 单块旋转角度      |
| opacity    | `0.15`               | 单块透明度        |
| zIndex     | `1`                  | 局部 overlay 层级 |
| color      | `token.colorText`    | 文字颜色          |
| fontSize   | `token.fontSizeSM`   | 文字字号          |
| lineHeight | `token.lineHeightSM` | 文字行高          |
| fontFamily | `token.fontFamily`   | 字体              |
| fontWeight | —                    | 字重              |

```tsx | pure
import { ConfigProvider, Watermark } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    components: {
      Watermark: {
        color: '#1677ff',
        gapX: 12,
        opacity: 0.2,
        rotate: -12,
      },
    },
  }}
>
  <Watermark content="Internal" />
</ConfigProvider>
```

### Accessibility

overlay 使用 `pointerEvents="none"`，因此不会阻拦 children 的触摸；同时设置 `accessible={false}`、`accessibilityElementsHidden` 和 `importantForAccessibility="no-hide-descendants"`，重复的文字或图片不会成为无障碍树中的内容。children 自身的交互和无障碍属性仍由页面内容负责。

Watermark 默认只覆盖自己的布局区域，不会通过 Portal 覆盖整个窗口。需要页面级水印时，应把 `<Watermark style={{ flex: 1 }} />` 放在页面根部并让 root 占满页面；组件不提供 Web 专属的 `fullPage` API。
