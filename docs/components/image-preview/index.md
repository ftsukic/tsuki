---
title: ImagePreview 图片预览
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# ImagePreview 图片预览

<section className="component-doc-intro">

## 介绍

ImagePreview 提供独立的全屏图片预览 Portal，使用原生横向 paging，支持 pinch zoom、double tap、放大拖动、下拉 interactive dismiss，以及可选的缩略图 rect 连续过渡。图片页由 FlatList 的 render window 管理。

</section>

<code src="../../../src/image-preview/__fixtures__/overview.tsx" title="组件预览" description="ImagePreview 的基础、手势和缩略图过渡示例。"></code>

## 引入

```tsx | pure
import { ImagePreview, showImagePreview } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/image-preview/__fixtures__/examples/basic.tsx" title="基础用法" description="打开多图预览、显示页码并支持关闭。"></code> <code src="../../../src/image-preview/__fixtures__/examples/gesture.tsx" title="手势交互" description="验证 pinch、double tap、zoom pan 和 interactive dismiss。"></code> <code src="../../../src/image-preview/__fixtures__/examples/transition.tsx" title="缩略图过渡" description="使用 sourceRect 从缩略图连续过渡到全屏。"></code>

## API

### ImagePreviewProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | `false` | 是否显示；关闭时会等待退出动画完成后销毁 Portal 内容 |
| images | `ImagePreviewImage[]` | `[]` | 图片字符串、React Native `ImageSourcePropType` 或带尺寸元数据的对象 |
| startPosition | `number` | `0` | 初始页码；根据 `loop` 自动归一化或限制范围 |
| loop | `boolean` | `true` | 是否循环切换 |
| showIndex | `boolean` | `true` | 是否显示 `当前页/总数` |
| showIndicators | `boolean` | `false` | 是否显示底部圆点 |
| minZoom / maxZoom | `number` | `0.5 / 3` | pinch 的 rubber-band 边界；释放后稳定倍率回到 `1..maxZoom` |
| doubleTapZoom | `number` | `2` | 首次 double tap 的目标倍率 |
| closeable | `boolean` | `false` | 是否显示关闭按钮 |
| closeOnPressImage | `boolean` | `true` | 单击图片是否请求关闭；double tap 不会触发第一次单击关闭 |
| closeOnPressOverlay | `boolean` | `true` | 单击遮罩是否请求关闭 |
| closeOnGesture | `boolean` | `true` | 是否启用向下拖动关闭 |
| sourceRect | `ImagePreviewRect \| null` | `null` | 打开时使用的缩略图 window rect，也用于没有 getter 的关闭过渡 |
| getSourceRect | `(index) => ImagePreviewRect \| null \| Promise<...>` | — | 按当前页获取缩略图 rect；返回 null 时安全回退到淡出关闭 |
| swipeDuration | `number` | — | 保留兼容字段；原生 FlatList paging 不使用自定义切页动画时长 |
| transitionDuration | `number` | token | 缩略图与全屏之间的 rect 动画时长 |
| renderImage | `(image, index) => ReactNode` | — | 替换默认 RN Image 内容；自定义内容需要自行设置尺寸 |
| renderIndex | `({ index, total }) => ReactNode` | — | 自定义页码 |
| renderToolbar | `({ index, total }) => ReactNode` | — | 自定义工具栏扩展口 |
| onChange | `(index) => void` | — | logical index 改变时调用一次 |
| onScale | `({ index, scale }) => void` | — | pinch 或 double tap settle 后回调 |
| onRequestClose | `(reason) => void` | — | 关闭请求；reason 为 `gesture`、`image`、`overlay`、`close-icon`、`back` 或 `imperative` |
| onOpen / onOpened | `() => void` | — | 打开开始、打开动画结束 |
| onClose / onClosed | `(reason?) => void` / `() => void` | — | 关闭开始、关闭动画结束 |
| style | `StyleProp<ViewStyle>` | — | fullscreen root 样式 |
| styles | `ImagePreviewStyles` | — | `root`、`overlay`、`pager`、`controls`、`index`、`closeButton`、`closeLabel` 语义样式 |

ImagePreview 继承 React Native `ViewProps`，不提供 Popup、Web DOM、CSS `className` 或自动滚动查找缩略图的 API。字符串图片会转换为 `{ uri: value }`。

### ImagePreviewRef

```ts
interface ImagePreviewRef {
  swipeTo(index: number, options?: { immediate?: boolean }): void
  resetScale(): void
}
```

### Imperative API

`showImagePreview(options)` 与 `closeImagePreview()` 共享默认配置。命令式关闭也会等待 close transition 的 `onClosed` 后才调用 `unmountPortal`。

### 主题

通过 `ConfigProvider` 的 `theme.components.ImagePreview` 覆盖 `zIndex`、`overlayColor`、页码颜色与字号、关闭按钮颜色与尺寸、位置和 `animationDuration`。方向锁距离、dismiss 阈值和速度属于实现常量，不在 token 中暴露。
