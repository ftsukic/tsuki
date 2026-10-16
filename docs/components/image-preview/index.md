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

ImagePreview 使用稳定图片 ID 管理完整图片序列，支持虚拟分页、双击与双指缩放、放大拖动、下拉关闭、原图加载和业务工具栏。图片初始按原图比例完整展示，双击放大到 2 倍，双指最多放大到 4 倍。聊天列表、普通相册和在线图片使用同一预览核心、图片布局与安全区规则。

图片数据独立于消息的挂载状态。消息列表回收单元不会删除预览图片；加载历史消息插入图片时，当前图片继续由 `activeId` 标识。缩略图位置通过可选的 `ImagePreview.Source` 登记。

</section>

<code src="../../../src/image-preview/__fixtures__/overview.tsx" title="组件预览" description="统一查看器的基础、自定义 adapter、手势和来源过渡示例。"></code>

## 引入

```tsx | pure
import { ImagePreview } from '@ftsukic/tsuki'
```

## 组件族与来源

```tsx | pure
<TsukiProvider safeArea>
  <ImagePreview.Provider>
    <ImagePreview.Source imageId={item.id} disabled={!viewable} style={{ width: 96, height: 64 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="打开图片预览"
        onPress={() => {
          setActiveId(item.id)
          setVisible(true)
        }}
      >
        <Image source={item.thumbnail ?? item.source} style={{ width: 96, height: 64 }} />
      </Pressable>
    </ImagePreview.Source>
    <ImagePreview
      visible={visible}
      items={items}
      activeId={activeId}
      onChange={({ id }) => setActiveId(id)}
      onRequestClose={() => setVisible(false)}
    />
  </ImagePreview.Provider>
</TsukiProvider>
```

Provider 放在应用根 Portal 内、导航容器外，统一捕获来源注册范围与根 Portal；不要求安装 Teleport。`ImagePreview.Source` 继承 `ViewProps`，必须传入与 `items` 对应、在当前 Provider 内唯一的 `imageId`；`children` 和确定的宽高由业务提供，组件不负责打开预览或提供按钮语义。`disabled` 默认 `false`，为 `true` 时排除该来源的测量，但继续显示内容。

虚拟列表使用可见项回调设置 `disabled`，排除已挂载但被列表裁切的缩略图。来源卸载不改变相册顺序，缺少有效来源时淡出关闭。打开准备完成且预览可显示后隐藏来源，归位完成后恢复来源，再移除预览。首次加载有界等待，失败或超时转为查看器的错误/加载画面，不阻塞关闭。

命令式方法优先使用已挂载 Provider 捕获的根 Host 与来源上下文；没有来源 Provider 时仍可在 Tsuki 根 Portal 中打开普通相册。

## 手势规则

基础比例和放大状态由同一个 UI 线程控制器驱动分页。FlatList 只承载虚拟页面，原生滚动保持关闭。

- 横向先移动图片，到边缘后剩余位移进入分页；反向退回后，剩余位移交还图片，无需抬手。
- 旧图保持缩放滑出，新图按自身基础比例进入；取消分页保留旧图缩放。
- 双击与双指作用于整个预览容器，包含留白；双击在基础比例和 2 倍之间切换，双指可临时缩到 0.5 倍、最多放大 4 倍，松手恢复合法边界。
- 双击、双指可以接管分页归位，按当前位置确定最近一页；新手势会取消旧动画完成事件。
- 纵向先移动图片内容，到顶部边界后继续向下才进入退出拖动；未达到关闭条件或父级拒绝关闭时恢复。
- 工具栏透明度读取分页/退出进度，点击权限独立管理，不成为图片交互的前提。

## 代码演示

<code src="../../../src/image-preview/__fixtures__/examples/basic.tsx" title="基础用法" description="通过稳定图片 ID 选择图片，复用统一工具栏。"></code>

<code src="../../../src/image-preview/__fixtures__/examples/custom-renderer.tsx" title="自定义图片 adapter" description="同一个 adapter 负责图片渲染和邻页预加载。"></code>

<code src="../../../src/image-preview/__fixtures__/examples/gesture.tsx" title="手势交互" description="横竖图切换、缩放、拖动、短拖恢复和下拉关闭。"></code>

<code src="../../../src/image-preview/__fixtures__/examples/transition.tsx" title="缩略图过渡" description="正方形 cover 缩略图打开后仍按原图比例完整展示。"></code>

<code src="../../../src/image-preview/__fixtures__/examples/chat-messages.tsx" title="聊天网络图片 · 300 张" description="虚拟化消息列表、独立缩略图、完整预览序列与长按自定义 Popup。"></code>

## API

### ImagePreviewImage

```ts
interface ImagePreviewImage {
  id: string
  width: number
  height: number
  source: ImageSourcePropType
  thumbnail?: ImageSourcePropType
  original?: ImageSourcePropType
}
```

`id` 在当前图片序列中必须唯一，始终对应同一份媒体。`width`、`height` 是原图的有效尺寸，必须为正数；组件根据它们计算全屏 `contain` 和每页手势边界，不使用缩略图盒子的比例代替原图比例。

`source` 是日常预览图片，`thumbnail` 是可选的低分辨率占位图，`original` 是按需加载的原始图片。消息缩略图由业务渲染，通常使用 `thumbnail`。来源完整保留 React Native 图片 source 的 headers 等字段，业务接入自定义图片引擎时也应完整转发。

### ImagePreviewProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | `false` | 受控显示状态；设为 false 后完成退出动画再移除覆盖内容 |
| items | `readonly ImagePreviewImage[]` | 必填 | 有序图片序列，与来源组件是否挂载无关 |
| activeId | `string` | 第一张图片 | 选中图片的稳定 ID；通过 `onChange` 同步用户分页结果 |
| closeable | `boolean` | `true` | 是否显示右上角关闭按钮 |
| closeOnGesture | `boolean` | `true` | 是否允许向下拖动关闭 |
| showIndex | `boolean` | `false` | 是否显示顶部页码；默认无页码，也不显示分页圆点 |
| interactionDisabled | `boolean` | `false` | 暂停预览手势、工具栏和无障碍交互；业务 Popup 打开时设为 true |
| transitionDuration | `number` | motion 配置 | 打开和关闭过渡时长；为 0 时直接完成，不等待图片加载 |
| getSourceRect | `(id: string) => ImagePreviewRect \| null \| Promise<ImagePreviewRect \| null>` | — | 自定义来源位置；来源不存在、不可见或获取超时时淡出，不阻止退出 |
| imageAdapter | `ImagePreviewImageAdapter` | RN Image | 自定义图片渲染和预加载，保留完整 source |
| renderIndex | `(params: ImagePreviewImageParams) => ReactNode` | — | 自定义页码；提供后即显示，无需设置 `showIndex` |
| renderToolbar | `(params: ImagePreviewToolbarParams) => ReactNode` | — | 底部业务工具栏；组件统一定位、边距与底部安全区 |
| renderOverlay | `(params: ImagePreviewImageParams) => ReactNode` | — | 自定义 Popup 等浮层；与查看器使用同一根 Portal，位于图片手势及工具栏之外 |
| onChange | `(params: ImagePreviewImageParams) => void` | — | 当前图片 ID 改变时通知 |
| onLongPress | `(params: ImagePreviewImageParams) => void` | — | 全屏预览区域按住 500ms 即通知，无需松手；可打开自定义 Popup |
| onRequestClose | `(reason: ImagePreviewCloseReason) => void` | — | 请求业务将 visible 设为 false |
| onOpen / onOpened | `() => void` | — | 打开开始、打开动画结束 |
| onClose / onClosed | `() => void` | — | 关闭开始、退出完成；来源缩略图在退出完成后恢复 |
| style | `StyleProp<ViewStyle>` | — | 全屏 root 样式 |
| styles | `ImagePreviewStyles` | — | `root`、`mask`、`pager`、`controls`、`index`、`close`、`closeContent`、`toolbar` 语义样式，支持对象或函数 |

组件继承 React Native `ViewProps`，覆盖 `children` 和原生 `style` 类型。预览不循环；自动滚动聊天列表、保存到相册、消息转发、系统分享和菜单内容由业务实现。

预览图片节点在打开、拖动与关闭期间保持连续；关闭不新建一张过渡图片，也不等待另一次网络请求。来源已被虚拟列表回收时安全淡出。工具栏位于图片手势之外，关闭和禁用期间不能触发业务操作。

### 回调与工具栏

```ts
interface ImagePreviewImageParams {
  id: string
  item: ImagePreviewImage
  index: number
  count: number
}

interface ImagePreviewToolbarParams extends ImagePreviewImageParams {
  close(): void
  original: {
    available: boolean
    status: 'idle' | 'loading' | 'loaded' | 'error'
    load(): void
  }
}
```

`original.load()` 请求加载当前项的 `original`。原图成功前继续显示已有图片；失败后 `status` 为 error，可再次调用 load 重试。原图尺寸变化不应由业务再叠加一层图片节点或额外维护外部加载 store。

关闭原因包括 `gesture`、`image`、`overlay`、`close-icon`、`back`、`imperative` 和 `removed`。当前图片被移除时由组件请求关闭。Android 返回键、无障碍逃逸和可访问关闭按钮使用同一退出生命周期。

长按菜单通过 `onLongPress` 更新业务 state，再通过 `renderOverlay` 渲染自定义 `Popup`。该插槽与查看器共享根 Portal，避免页面内部 `PortalHost` 使菜单被全屏图片覆盖或裁切；插槽自身不添加定位或安全区。菜单显示及退出期间，将 `interactionDisabled` 设为 true，Popup 完成退出后再恢复预览交互。聊天网络图片示例展示了完整接法。

### 图片 adapter

```ts
interface ImagePreviewImageAdapter {
  render(props: {
    source: ImageSourcePropType
    style: StyleProp<ImageStyle>
    onLoadStart(): void
    onLoad(): void
    onError(): void
    testID?: string
  }): ReactNode
  preload?(source: ImageSourcePropType): void | Promise<unknown>
}
```

将 `style` 应用到最终图片节点，使用 `contain`，并转发加载回调。组件提供明确的图片布局宽高和当前页加载反馈；adapter 不需要实现缩放、错误遮罩或关闭动画。`preload` 应与 render 使用同一图片引擎及缓存。是否加载完成以当前节点回调为准，历史预取成功不会替代当前加载状态。

### ImagePreviewRef

```ts
interface ImagePreviewRef {
  swipeTo(id: string, options?: { immediate?: boolean }): void
  resetScale(): void
}
```

### 命令式使用

`showImagePreview(options)` 使用同一套 `items`、`activeId`、adapter 和工具栏契约。`closeImagePreview()` 在退出完成后卸载。命令式用法需要应用已安装 `TsukiProvider` 的 Portal。

### Provider 与 Source 类型

`ImagePreviewProviderProps` 仅接受 `children`。`ImagePreviewSourceProps` 继承 `ViewProps` 并要求 `imageId: string`、`children: ReactNode`，可选 `disabled: boolean`、`clipRef: RefObject<View | null>`。当来源位于滚动列表内时，将列表可视区域外层的原生 View ref 传入 `clipRef`（该 View 使用 `collapsable={false}`）。预览归位时会同步收进这个裁切区域，部分露出的来源保持完整几何，避免图片覆盖列表外的内容。内部来源注册、几何值及交互状态不对外导出。

### 主题与迁移

通过 `ConfigProvider` 的 `theme.components.ImagePreview` 配置组件 token，通过现有 motion 配置控制动画、Reduced Motion 和时长倍率。

这是一次破坏式更新。旧 `images`、`startPosition`、`sourceRect`、`renderImage`、循环和旧缩放配置不再使用；将图片转换成带稳定 ID 和尺寸的 `items`，用 `activeId` 选择图片，用 `imageAdapter` 接入图片引擎。`ImagePreview.Source` 只登记来源位置，所有全屏查看统一使用本组件。

内部实现入口 `ImagePreviewContent`、`ImagePreviewItem`、`ImagePreviewTransition` 以及旧的几何计算、图片归一化工具函数不再从公共 barrel 导出。业务统一使用 `ImagePreview`、公共类型和命令式方法，不直接依赖内部节点或辅助函数。

本次整合删除 `SharedImagePreview`、`SharedImagePreviewProvider` 及对应类型和独立文档入口，不提供别名。所有来源改为 `ImagePreview.Source`，注册范围改为 `ImagePreview.Provider`；`items`、业务工具栏和受控关闭统一配置在 `ImagePreview`。

### 视频与自定义媒体

`items` 的成员可以指定 `type: 'video'`（默认 `image`）。视频必须提供封面 `thumbnail` 和尺寸，`source` 交给业务播放器处理。通过 `renderMedia: (props: ImagePreviewMediaRenderProps) => ReactNode` 接入播放器，组件库不依赖视频引擎。

渲染参数包含 `item`、`style`、`active`、`playing`、`onLoad`、`onError`。`active` 表示当前选中页，包含打开与关闭过渡；`playing` 仅在打开完成、仍可见且可交互时为 true。建议只在 active 时挂载播放器，按 playing 控制暂停。切页和关闭时必须暂停，卸载时释放。首帧就绪前保留封面，关闭时保留播放器暂停帧，避免黑屏。

视频与图片复用同一分页、缩放、拖动关闭和来源裁切；媒体画面不接收触摸。播放器原生 controls 应关闭，播放、暂停和进度操作放到 `renderToolbar`，避免与预览手势冲突。图片适配器只加载视频封面，不会请求视频 source。当前 Example 的“图片与视频混合聊天”通过 react-native-video 演示此组合。
