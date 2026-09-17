---
title: SwipeCell 滑动单元格
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# SwipeCell 滑动单元格

<section className="component-doc-intro">

## 介绍

SwipeCell 用于在列表行上通过水平滑动展示操作，提供 Vant 风格的左右多 action、吸附阈值、命令式控制和 Provider 级单开协调。

</section>

<code src="../../../src/swipe-cell/__fixtures__/overview.tsx" title="组件预览" description="SwipeCell 的微信消息列表、多 action、协调、列表、分组和主题示例。"></code>

## 引入

```tsx | pure
import { SwipeCell, SwipeCellAction, SwipeCellGroup, useSwipeCellController } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/swipe-cell/__fixtures__/examples/basic.tsx" title="基础用法" description="展示单个右侧 action、滑动吸附和 action 点击反馈。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/both-sides.tsx" title="左右双侧操作" description="展示左右两侧 action 的独立配置。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/multiple-actions.tsx" title="多个 action" description="展示同一侧多个 action 及其总宽度。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/coordination.tsx" title="Provider 级单开" description="展示不依赖 SwipeCellGroup 的全局单开行为。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/wechat.tsx" title="微信消息列表" description="展示微信消息列表风格的稳定 id、右侧 action 和主体布局。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/content-close.tsx" title="点击主体关闭" description="展示关闭展开项时保留主体原有 Pressable 事件。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/list.tsx" title="列表用法" description="展示列表滚动时通过控制 hook 关闭当前项。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/flash-list.tsx" title="FlashList 1000 条" description="展示 FlashList 回收大量 SwipeCell 时的稳定 id 和滚动关闭。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/ref.tsx" title="Ref 控制" description="展示通过 ref 调用 open 和 close。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/group.tsx" title="SwipeCellGroup" description="展示同一 Group 内自动关闭其他 cell。"></code>

<code src="../../../src/swipe-cell/__fixtures__/examples/theme.tsx" title="主题定制" description="展示通过 ConfigProvider 覆盖 SwipeCell component token。"></code>

## API

### SwipeCell

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| id | `string` | 自动生成 | 业务稳定 id；用于 FlashList recycle 和 Provider 内互斥管理 |
| children | `ReactNode` | — | 行的主体内容，位于 action 层上方 |
| actions | `SwipeCellActionItem[]` | — | 微信消息列表风格的右侧 action 简写 |
| leftActions | `SwipeCellActionItem[]` | — | 从左侧滑入的多个 action；展开方向为向右 |
| rightActions | `SwipeCellActionItem[]` | — | 从右侧滑入的多个 action；展开方向为向左 |
| leftAction | `ReactNode` | — | 兼容旧用法的单个左侧 action；当 `leftActions` 已传入时忽略 |
| rightAction | `ReactNode` | — | 兼容旧用法的单个右侧 action；当 `rightActions` 已传入时忽略 |
| onLeftActionPress | `PressableProps['onPress']` | — | `leftAction` 不是 `SwipeCellAction` 时的点击回调 |
| onRightActionPress | `PressableProps['onPress']` | — | `rightAction` 不是 `SwipeCellAction` 时的点击回调 |
| closeOnActionPress | `boolean` | `true` | action 点击后是否自动关闭当前 cell |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于默认样式 |
| contentStyle | `StyleProp<ViewStyle>` | — | 主体 Animated.View 样式 |
| actionStyle | `StyleProp<ViewStyle>` | — | action 背景层样式 |
| ref | `SwipeCellRef` | — | 暴露 `open(side?)` 和 `close()` |
| onOpen | `() => void` | — | action 完成展开后的回调 |
| onClose | `() => void` | — | action 完成关闭后的回调 |

SwipeCell 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。`open()` 默认展开右侧 action；如果右侧没有可测宽度，会回退到左侧 action。action 宽度由实际布局测量，拖动结束时位移严格超过对应宽度的 50% 才展开，等于或低于 50% 则关闭。

组件使用 Gesture Handler 的 `Gesture.Pan()` 处理水平拖动，主体通过 Reanimated `Animated.View` 的 `translateX` 移动；主体 pressed 时使用 Cell 的 `pressedBackgroundColor`，action pressed 时在原彩色背景上显示 `actionPressedOverlayColor`，不会整体变透明。关闭状态下没有可用 action 时不会响应滑动；`activeOffsetX` 和 `failOffsetY` 用于避免误抢纵向列表手势。展开后点击主体会关闭当前 cell，但不会阻止主体子组件自己的 press 事件。

`actions` 是 `rightActions` 的简写；每一项可以使用 `text`、`color` 和 `onPress`。`leftActions` 和 `rightActions` 的每一项都会独立渲染为 `SwipeCellAction`，action slot 的测量宽度是所有 action 的总宽度。传入 action 数组时，数组优先于对应的旧 `leftAction` / `rightAction`。旧的 `label` 字段继续兼容，推荐新代码使用 `text`。

`Provider` 会自动安装 SwipeCell manager。同一 Provider 下任意 SwipeCell 打开时，之前展开的 SwipeCell 会自动关闭，不需要包裹 `SwipeCellGroup`。`Provider` 中其它组件库交互控件（例如 `Cell`、`Button`）开始按下时，也会关闭当前展开项；SwipeCell 主体和 action 会保留自己的 press 语义。开始滚动列表时，业务可以通过控制 hook 主动关闭当前项：

```tsx | pure
const swipeCell = useSwipeCellController()

<FlatList onScrollBeginDrag={swipeCell.closeCurrent} />
```

React Native 没有 Web DOM 的全局 click-outside 事件。页面中的自定义原生 `Pressable` 或滚动事件仍应显式调用 `swipeCell.closeCurrent()`；组件库的 `InteractionPressable` 会自动接入 coordinator。

### SwipeCellActionItem

```tsx | pure
interface SwipeCellActionItem {
  key?: React.Key
  text?: ReactNode
  /** @deprecated Use text instead. */
  label?: ReactNode
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  backgroundColor?: ColorValue
  textColor?: ColorValue
  width?: number
  disabled?: boolean
  onPress?: PressableProps['onPress']
}
```

`width` 只控制该 action 的宽度；未指定时使用 token 的最小宽度和内容布局。`disabled` 会阻止点击，也不会触发默认关闭。

### SwipeCellAction

`SwipeCellAction` 是内置的 action 按钮，基于库内置 `Pressable` 渲染，点击时在原背景上提供黑色 10% overlay，并接入 interaction coordinator；适合直接作为旧版 `leftAction` 或 `rightAction` 使用，也可用于保留高级自定义 Pressable 能力。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | action 内容；字符串和数字使用内置文字样式 |
| onPress | `PressableProps['onPress']` | — | action 点击回调 |
| color | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | — | 使用 SwipeCell 语义背景 token |
| backgroundColor | `ColorValue` | `SwipeCell` token | action 背景色 |
| textColor | `ColorValue` | `SwipeCell` token | 字符串/数字 children 的文字颜色 |
| width | `number` | — | 显式 action 宽度；不传时使用内容宽度和最小宽度 |
| style | `PressableProps['style']` | — | action Pressable 样式 |
| 其他 PressableProps | React Native `PressableProps` | — | 例如 `testID`、`accessibilityLabel`、`disabled` 和 `hitSlop` |

传入普通 `ReactNode` 时，SwipeCell 会自动使用 `SwipeCellAction` 包裹它；需要独立颜色、宽度或点击状态时，推荐显式传入 `SwipeCellAction`。

### SwipeCellRef

```tsx | pure
const ref = useRef<SwipeCellRef>(null)

ref.current?.open('right')
ref.current?.open('left')
ref.current?.close()
```

### SwipeCellGroup

`SwipeCellGroup` 继承 React Native `ViewProps`。它保留旧版局部 grouping 行为：任意一个 cell 通过拖动或 ref 打开时，其他已注册 cell 会自动关闭。Provider coordinator 已经保证同一 Provider 下的全局单开，因此新列表不需要使用 Group；Group 不提供 overlay 或 outside press 行为。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | SwipeCell 子项 |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 样式 |
| 其他 ViewProps | React Native `ViewProps` | — | 例如 `testID`、`onLayout` 和 `accessibilityLabel` |

## 主题定制

通过 `ConfigProvider` 的 `theme.components.SwipeCell` 覆盖 action 默认 token：

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      SwipeCell: {
        actionBackgroundColor: '#7232DD',
        actionMinWidth: 88,
      },
    },
  }}
>
  <SwipeCell rightAction="更多">
    <Text>主题化行</Text>
  </SwipeCell>
</ConfigProvider>
```

可覆盖的 token 包括 `backgroundColor`、`actionBackgroundColor`、`actionDefaultBackgroundColor`、`actionPrimaryBackgroundColor`、`actionSuccessBackgroundColor`、`actionWarningBackgroundColor`、`actionDangerBackgroundColor`、`actionTextColor`、`actionHeight`、`actionMinWidth`、`actionPaddingHorizontal`、`actionFontSize`、`actionLineHeight`、`actionPressedOverlayColor`、`animationDuration` 和 `fontFamily`。主题的 `motion: false` 会跳过吸附动画并直接设置目标位置。

当前不实现 Vant Web 专属的 DOM、`beforeClose`、`name`、`stopPropagation` 或浏览器事件 API。
