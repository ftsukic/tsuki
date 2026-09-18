---
title: Navbar 导航栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Navbar 导航栏

<section className="component-doc-intro">

## 介绍

Navbar 提供 Vant 4 风格的顶部导航栏。它使用左侧、标题、右侧三个可选布局区域：左右内容固定在两侧，标题通过自身的左右 auto margin 保持居中。

</section>

<code src="../../../src/navbar/__fixtures__/overview.tsx" title="组件预览" description="Navbar 的基础操作、固定定位、安全区和 custom slot 用法。"></code>

## 引入

```tsx | pure
import { Navbar, Pressable } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/navbar/__fixtures__/examples/basic.tsx" title="基础用法" description="默认显示居中标题，不显示返回箭头。"></code>

<code src="../../../src/navbar/__fixtures__/examples/title-only.tsx" title="仅标题" description="展示没有左右操作内容的导航栏。"></code>

<code src="../../../src/navbar/__fixtures__/examples/left-arrow.tsx" title="返回按钮" description="通过 leftArrow 显示内置返回箭头。"></code>

<code src="../../../src/navbar/__fixtures__/examples/left-text.tsx" title="左侧文字" description="组合返回箭头和左侧文字。"></code>

<code src="../../../src/navbar/__fixtures__/examples/right-action.tsx" title="右侧按钮" description="使用 rightText 和 onPressRight 创建右侧操作。"></code>

<code src="../../../src/navbar/__fixtures__/examples/disabled-actions.tsx" title="禁用操作" description="左右操作独立禁用，但仍保留各自的布局区域。"></code>

<code src="../../../src/navbar/__fixtures__/examples/custom-left.tsx" title="自定义左侧内容" description="使用 left 自定义渲染，并覆盖默认左侧内容。"></code>

<code src="../../../src/navbar/__fixtures__/examples/custom-right.tsx" title="自定义右侧内容" description="使用 right 自定义渲染，并覆盖默认右侧文字。"></code>

<code src="../../../src/navbar/__fixtures__/examples/three-sections.tsx" title="三个槽位" description="使用单一 custom slot 和 Navbar 级回调。"></code>

<code src="../../../src/navbar/__fixtures__/examples/two-sections.tsx" title="多个 Action" description="在一个 custom slot 内组合多个独立 Pressable。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-title.tsx" title="长标题" description="长标题单行显示并尾部省略，仍保持物理居中。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-actions.tsx" title="长操作" description="左右操作变长时，标题中心和三槽定位保持稳定。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-left-text.tsx" title="长左侧文字" description="展示左侧文字的单行行为。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-right-action.tsx" title="长右侧操作" description="展示右侧文字的单行行为。"></code>

<code src="../../../src/navbar/__fixtures__/examples/fixed.tsx" title="固定顶部" description="fixed 在 React Native 中使用 absolute top/left/right 定位。"></code>

<code src="../../../src/navbar/__fixtures__/examples/fixed-placeholder.tsx" title="固定并占位" description="fixed 和 placeholder 组合时为页面内容保留 Navbar 高度。"></code>

<code src="../../../src/navbar/__fixtures__/examples/safe-area.tsx" title="顶部安全区" description="safeAreaInsetTop 在 46 点内容区上方加入顶部 inset。"></code>

## 布局行为

Navbar 的结构始终是：

```text
root
└── bar (relative / normal flex row)
    ├── left   optional / absolute left
    ├── title  optional / normal flow / margin auto / maxWidth 60%
    └── right  optional / absolute right
```

默认内容区高度为 `46`。title 存在时处于 bar 的正常布局流中，通过左右 `auto` margin 居中，最大宽度为 `60%`，并由容器隐藏溢出。字符串 title 由 Navbar 渲染为单行尾部省略；自定义 ReactNode 只共享 title 容器的 margin auto、`maxWidth: '60%'` 和 overflow 约束，其内部文本换行和省略行为由业务节点自行控制。left 和 right 只有存在实际内容时才渲染，固定在两侧，并由 slot 本身提供默认 `16` 点水平内边距；这些边缘 inset 不会因为是否传入 `onPressLeft` 或 `onPressRight` 而变化。

没有传入 title 时也不会切换成 space-between 两栏布局，title 节点不会渲染。没有 leftArrow、leftText 或自定义 left 时不会渲染 left 节点；没有 rightText 或自定义 right 时不会渲染 right 节点。仅传 `onPressLeft`/`onPressRight` 也不会创建空点击区域。

```tsx
<Navbar title="详情" rightText="更多" onPressRight={onMore} />
```

## 自定义 slot 和点击行为

`leftText` 是默认左侧文本，由 Navbar 内部创建 `Text` 渲染；`rightText` 是默认右侧文本，同样由 Navbar 内部创建 `Text` 渲染。两者只接受 `string`，Navbar 负责文字颜色、字号、lineHeight，以及单行尾部省略。

`left` 是自定义左侧 render，存在时覆盖 `leftArrow` 和 `leftText`；`right` 是自定义右侧 render，存在时覆盖 `rightText`。自定义节点由 Navbar 原样渲染，Navbar 不会向其中注入默认文字样式。

当 `leftArrow` 和 `leftText` 同时存在时，左侧 slot 直接包含 `Icon` 和内部 `Text`，箭头与文本之间的间距作用于箭头本身。`leftArrow` 单独存在时只渲染 `Icon`。

left 和 right 只替换对应槽位的内容，不会自动取消 Navbar 级的 onPressLeft 或 onPressRight。传入 slot 级回调时，Navbar 会让整个 custom slot 成为一个可点击区域：

```tsx
<Navbar
  left={<Text>自定义返回</Text>}
  onPressLeft={onBack}
  right={<Text>自定义完成</Text>}
  onPressRight={onDone}
  title="编辑"
/>
```

一个 slot 需要多个独立操作时，在 custom slot 内组合多个通用 `Pressable`。这种情况下不要同时传入对应的 `onPressLeft` 或 `onPressRight`，以免 slot 级点击与内部操作重复：

```tsx
<Navbar
  right={
    <View style={{ flexDirection: 'row' }}>
      <Pressable onPress={onAdd}>
        <Icon name="PlusOutlined" />
      </Pressable>
      <Pressable onPress={onMore}>
        <Icon name="EllipsisOutlined" />
      </Pressable>
    </View>
  }
  title="详情"
/>
```

## 语义样式

`styles.title` 控制 title 容器，包括 auto margin、最大宽度和布局样式；`styles.titleText` 只控制 Navbar 自动生成的字符串标题 Text：

```tsx
<Navbar
  title="详情"
  styles={{
    title: { maxWidth: '80%' },
    titleText: { fontSize: 18 },
  }}
/>
```

使用 custom ReactNode title 时，`styles.title` 仍然作用于 title 容器，但 `styles.titleText` 不会注入 custom 节点；内部文字的换行、省略和视觉样式由业务节点自行控制：

```tsx
<Navbar title={<Text>详情</Text>} styles={{ title: { marginLeft: 24 } }} />
```

## fixed、placeholder 和安全区

fixed 在 React Native 中映射为根 View 的 `position: 'absolute'`、`top: 0`、`left: 0`、`right: 0`，不是 Web 的 `position: fixed`。zIndex 默认是 `1`，并应用在真实 Navbar 根 View 上。

只有 fixed && placeholder 时才渲染占位 View，占位高度为 `46 + topInset`。占位 View 不重复渲染 Navbar 内容，也不承载可访问性语义；placeholder 单独使用时不会增加第二份高度。

safeAreaInsetTop 默认关闭。开启后，Navbar 使用最近的 SafeAreaProvider 顶部 inset，把 bar 放在 inset 下方；没有 provider 时 inset 按 `0` 处理。Navbar 的 height token 始终只表示 `46` 点内容区高度。

## API

### Navbar

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 中心导航标题；字符串自动单行尾部省略 |
| leftText | `string` | — | 默认左侧文本，由 Navbar 内部 `Text` 渲染 |
| rightText | `string` | — | 默认右侧文本，由 Navbar 内部 `Text` 渲染 |
| leftArrow | `boolean` | `false` | 是否显示内置 `LeftOutlined` |
| leftIconSize | `number` | `Navbar` token 的 `iconSize` | 内置左箭头尺寸；Tsuki RN 扩展，只作用于内置箭头 |
| leftDisabled | `boolean` | `false` | 是否禁用左侧操作；不影响 slot 是否因内容存在而渲染 |
| rightDisabled | `boolean` | `false` | 是否禁用右侧操作；不影响 slot 是否因内容存在而渲染 |
| onPressLeft | `PressableProps['onPress']` | — | 左侧默认内容或 custom left 整体的点击回调 |
| onPressRight | `PressableProps['onPress']` | — | 右侧 `rightText` 或 custom right 整体的点击回调 |
| border | `boolean` | `true` | 是否显示底部 hairline |
| fixed | `boolean` | `false` | 是否使用 RN absolute 顶部定位 |
| placeholder | `boolean` | `false` | 仅和 `fixed` 同时为 true 时保留占位高度 |
| zIndex | `number` | `1` | 根 Navbar 的层级 |
| safeAreaInsetTop | `boolean` | `false` | 是否把顶部 safe-area inset 放在 46 点内容区之前 |
| left | `ReactNode` | — | 自定义左侧 render；存在时覆盖 `leftArrow` 和 `leftText`，不自动取消 slot 回调 |
| right | `ReactNode` | — | 自定义右侧 render；存在时覆盖 `rightText`，不自动取消 slot 回调 |
| style | `StyleProp<ViewStyle>` | — | 真实 Navbar 根 View 样式 |
| styles | `NavbarStyles` | — | `root`、`bar`、`left`、`title`、`titleText`、`right`、`divider` 语义样式 |

Navbar 继承 React Native ViewProps，但不接受 children。testID、ref 和 style 都作用于真实 Navbar 根 View。`styles.title` 控制 title 容器；`styles.titleText` 只控制内置字符串标题 Text。Navbar 不提供 layout、content、contentAlign、SearchBar、Tabs 或其他业务内容 API。

### 无障碍语义

Navbar 根节点本身是普通 View，不自动声明导航或按钮角色。配置了 slot 级 `onPressLeft`/`onPressRight` 的默认内容或 custom slot 会让整个 slot 成为 Pressable 并暴露 button 语义；`leftDisabled`/`rightDisabled` 会保留对应 slot 并交由 Pressable 暴露 disabled 状态，但不会响应点击。没有 slot 级回调的 custom slot 保留业务节点自己的语义。中心标题使用 Text，fixed placeholder 明确不承载可访问性语义。

### Theme

通过 ConfigProvider 的 theme.components.Navbar 覆盖 Navbar token。公开 token 包括：

| Token               | 默认语义                               |
| ------------------- | -------------------------------------- |
| `height`            | `46`                                   |
| `paddingHorizontal` | `16`                                   |
| `titleFontSize`     | `16`                                   |
| `actionFontSize`    | `14`                                   |
| `iconSize`          | `16`                                   |
| `actionColor`       | `#1989FA`                              |
| `titleColor`        | 主题文本色                             |
| `borderColor`       | 主题弱边框色（`colorBorderSecondary`） |

默认按压反馈透明度、图标与文字间距等行为继续使用现有全局 token，暗色模式的背景、文字和边框也都来自主题 token。
