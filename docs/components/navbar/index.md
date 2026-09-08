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

Navbar 提供 Vant 风格的顶部导航栏。标题位于 bar 的正常居中布局中，左右 action 使用统一的 `NavbarAction` 点击区域。

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

<code src="../../../src/navbar/__fixtures__/examples/long-title.tsx" title="Long title" description="展示长标题仍然保持居中。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-actions.tsx" title="Long actions" description="展示左右 action 变长时的稳定布局。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-left-text.tsx" title="Long left text" description="展示长左侧文字在有限宽度内省略。"></code>

<code src="../../../src/navbar/__fixtures__/examples/long-right-action.tsx" title="Long right action" description="展示长右侧操作在有限宽度内省略。"></code>

## 布局行为

Navbar 只提供 Vant 标题模式：

```text
| left (absolute) |       title       | right (absolute) |
```

`bar` 使用 `position: relative; align-items: center`。标题使用 `max-width: 60%` 并通过正常 flex 布局居中；`left` 和 `right` 使用 `position: absolute`、`top: 0`、`bottom: 0`，分别贴近两侧并保留 `paddingHorizontal`。为适配 RN 的长文本场景，两侧 action 还限制在中心标题之外的空间，并对文本使用单行尾部省略。

```tsx
<Navbar title="详情" rightText="更多" onPressRight={onMore} />
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

Navbar 继承 React Native `ViewProps`，但不接受 `content`、`children` 或 `contentAlign`。左右 action 都使用 `NavbarAction`；箭头使用 `Icon`，底线使用 `Divider`。

### NavbarAction

`NavbarAction` 基于 `InteractionPressable`，用于右侧文本、icon 或自定义 action：

```tsx
<NavbarAction onPress={onPress}>更多</NavbarAction>
```

它支持 `onPress`、`disabled`、`testID`、`accessibilityLabel` 和 `style`。`style` 可以使用 `({ pressed }) => ...` 根据按压状态返回样式。

### Theme

通过 `ConfigProvider` 的 `theme.components.Navbar` 覆盖 Navbar token。Navbar 只提供 `height`、`paddingHorizontal`、`titleFontSize`、`titleColor`、`actionFontSize`、`actionColor`、`iconSize` 和 `borderColor`。
