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

Navbar 提供 Vant 风格的顶部导航栏。组件根据是否传入 `title` 自动选择三槽居中布局或左右分栏布局，左右槽位中的最小交互单元是 `NavbarAction`。

</section>

<code src="../../../src/navbar/__fixtures__/overview.tsx" title="组件预览" description="Navbar 的基础标题、返回文字和右侧 action 用法。"></code>

## 引入

```tsx | pure
import { Navbar, NavbarAction } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/navbar/__fixtures__/examples/basic.tsx" title="Basic" description="展示 Vant 风格的居中标题。"></code>

<code src="../../../src/navbar/__fixtures__/examples/title-only.tsx" title="Title only" description="展示只有标题的导航栏。"></code>

<code src="../../../src/navbar/__fixtures__/examples/left-arrow.tsx" title="Left arrow" description="展示默认的左侧返回箭头。"></code>

<code src="../../../src/navbar/__fixtures__/examples/left-text.tsx" title="Left text" description="展示返回箭头与返回文字。"></code>

<code src="../../../src/navbar/__fixtures__/examples/right-action.tsx" title="Right action" description="展示单个 NavbarAction 的点击反馈。"></code>

<code src="../../../src/navbar/__fixtures__/examples/three-sections.tsx" title="Three sections" description="展示有标题时左右槽位与中心标题的独立布局。"></code>

<code src="../../../src/navbar/__fixtures__/examples/two-sections.tsx" title="Two sections" description="展示无标题时在左右槽位中组合多个独立 action。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-title.tsx" title="Long title" description="展示长标题仍然保持居中。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-actions.tsx" title="Long actions" description="展示左右 action 变长时的稳定布局。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-left-text.tsx" title="Long left text" description="展示默认左侧文字的单行行为。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-right-action.tsx" title="Long right action" description="展示默认右侧文字的单行行为。"></code>

## 布局行为

Navbar 根据 `title` 是否存在自动选择布局，不需要额外的 `layout` prop。

当 `title` 存在（包括自定义 `ReactNode`）时，使用三槽布局：

```text
| left (absolute) |       title       | right (absolute) |
```

中心槽位是全宽的绝对定位层并禁用指针事件，因此标题的物理中心不受左右内容宽度影响。字符串标题由 Navbar 渲染为单行尾部省略的 `Text`；自定义标题节点由业务自行控制尺寸与文本行为。`left` 和 `right` 槽位使用 `position: absolute`、`top: 0`、`bottom: 0`，不附加 padding 或宽度限制。

```tsx
<Navbar title="详情" rightText="更多" onPressRight={onMore} />
```

当 `title` 未传入或为 `null` 时，使用普通的左右分栏流式布局：

```text
| left (flexShrink: 1) | right (flexShrink: 1) |
```

此时 bar 使用 `justifyContent: 'space-between'`。Navbar 不会改变自定义 `left`/`right` 节点的尺寸，也不会自动添加左右 padding；需要间距时由业务节点或 `styles.left`/`styles.right` 提供。

```tsx
import { Navbar, NavbarAction } from '@ftsukic/tsuki'
import { View } from 'react-native'

function Example() {
  return (
    <Navbar
      left={
        <View style={{ paddingLeft: 12 }}>
          <NavbarAction onPress={onBack}>返回</NavbarAction>
        </View>
      }
      right={
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <NavbarAction onPress={onAdd}>+</NavbarAction>
          <NavbarAction onPress={onMore}>...</NavbarAction>
        </View>
      }
    />
  )
}
```

Navbar 不提供 SearchBar、Tabs、Calendar 等业务内容 API。需要复杂中间内容时，应由业务页面自行组合其他布局。

Navbar 不处理顶部 safe area。页面应使用 SafeArea 容器管理页面安全区域：

```tsx
import { SafeAreaView } from 'react-native-safe-area-context'

function Page() {
  return (
    <SafeAreaView edges={['top']}>
      <Navbar title="详情" />
    </SafeAreaView>
  )
}
```

## API

### Navbar

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 居中的导航标题 |
| leftText | `ReactNode` | — | 默认左侧 action 的文字 |
| rightText | `ReactNode` | — | 默认右侧 action 的文字 |
| leftArrow | `boolean` | `true` | 是否显示 `LeftOutlined` |
| onPressLeft | `PressableProps['onPress']` | — | 默认返回区域的点击回调 |
| onPressRight | `PressableProps['onPress']` | — | 默认右侧 action 的点击回调 |
| border | `boolean` | `true` | 是否渲染底部分割线 |
| left | `ReactNode` | — | 自定义左侧 action 内容；传入后覆盖默认返回内容 |
| right | `ReactNode` | — | 自定义右侧 action 内容；传入后覆盖 `rightText` |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `NavbarStyles` | — | root、bar、left、title、right、divider 语义样式 |

Navbar 继承 React Native `ViewProps`，但不接受 `content`、`children` 或 `contentAlign`。自定义 `left`/`right` 会直接渲染到对应槽位，不会再被 Navbar 包装成一个按钮；只有默认左侧返回内容和默认 `rightText` 会由 Navbar 创建 `NavbarAction`。箭头使用 `Icon`，底线使用 `Divider`。

### NavbarAction

`NavbarAction` 基于通用 `Pressable`，固定使用 opacity feedback，用于文本、icon 或自定义 action：

```tsx
<NavbarAction onPress={onPress}>更多</NavbarAction>
```

它支持 `onPress`、`disabled`、`testID`、`accessibilityLabel` 和 `style`。`style` 可以使用 `({ pressed }) => ...` 根据按压状态返回样式；不对外暴露 `pressStyle`，需要其他反馈方式时请直接在 Navbar 的自定义槽位中使用通用 `Pressable`。

### Theme

通过 `ConfigProvider` 的 `theme.components.Navbar` 覆盖 Navbar token。Navbar 提供 `height`、`paddingHorizontal`、`titleFontSize`、`titleColor`、`actionFontSize`、`actionColor`、`iconSize` 和 `borderColor`；其中 `paddingHorizontal` 为兼容保留，默认不会自动作用到 left/right slot。
