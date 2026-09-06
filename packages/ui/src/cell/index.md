---
title: Cell 单元格
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Cell 单元格

<section className="component-doc-intro">

## 介绍

单元格为列表中的单个展示项，适合展示标题、描述、右侧值和导航操作。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览" background="#f7f8fa"></code>

## 引入

```tsx | pure
import { Cell, ThemeProvider, Icon } from '@ftsukic/react-native-ui'
```

`Cell` 和 `Cell.Group` 需要放在 `ThemeProvider` 内使用。`Cell.Group` 既可以通过 `Cell.Group` 使用，也可以单独引入 `CellGroup`。分组中的最后一个直接 `Cell` 不显示分隔线，单独使用的 `Cell` 仍由 `border` 控制分隔线。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="Cell 可以单独使用，也可以与 Cell.Group 搭配使用。"></code>

<code src="./__fixtures__/examples/inset.tsx" title="卡片风格" description="Cell.Group 的 inset 属性可以将单元格转换为带圆角和外边距的卡片。"></code>

<code src="./__fixtures__/examples/sizes.tsx" title="单元格大小" description="size 支持 normal 和 large 两种尺寸。"></code>

<code src="./__fixtures__/examples/icon.tsx" title="展示图标" description="icon 支持 Icon 或其他 ReactNode，并显示在标题左侧。"></code>

<code src="./__fixtures__/examples/link.tsx" title="展示箭头" description="isLink 显示右侧箭头，arrowDirection 可以控制箭头方向。"></code>

<code src="./__fixtures__/examples/interactions.tsx" title="点击事件" description="React Native 使用 onPress 处理导航或业务操作，clickable 控制点击反馈。"></code>

<code src="./__fixtures__/examples/group.tsx" title="分组标题" description="Cell.Group 的 title 和 extra 可以展示分组标题及右侧附加内容。"></code>

<code src="./__fixtures__/examples/custom-content.tsx" title="使用自定义内容" description="使用 title、value、label、icon 和 extra 的 ReactNode 值实现自定义内容。"></code>

<code src="./__fixtures__/examples/center.tsx" title="垂直居中" description="center 可以让 Cell 的左右内容垂直居中，适合搭配 label 或较高的自定义内容。"></code>

## API

### CellGroup Props

| 属性     | 说明                       | 类型                      | 默认值  |
| -------- | -------------------------- | ------------------------- | ------- |
| title    | 分组标题                   | `ReactNode`               | —       |
| extra    | 标题右侧的附加内容         | `ReactNode`               | —       |
| inset    | 是否展示为圆角卡片风格     | `boolean`                 | `false` |
| border   | `inset` 时是否显示容器外框 | `boolean`                 | `true`  |
| children | 分组中的 Cell 内容         | `ReactNode`               | —       |
| testID   | 根容器测试标识             | `string`                  | —       |
| style    | 根容器样式                 | `StyleProp<ViewStyle>`    | —       |
| styles   | 语义样式                   | `CellGroupSemanticStyles` | —       |

### Cell Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 左侧标题 | `ReactNode` | — |
| value | 右侧内容 | `ReactNode` | — |
| label | 标题下方的描述信息 | `ReactNode` | — |
| extra | 单元格最右侧的附加内容 | `ReactNode` | — |
| size | 单元格大小，可选值为 `large`、`normal` | `CellSize` | `normal` |
| icon | 左侧图标或自定义节点 | `ReactNode` | — |
| border | 是否显示内边框；在 `Cell.Group` 中最后一个直接 Cell 不显示分隔线 | `boolean` | `true` |
| clickable | 是否开启点击反馈 | `boolean` | — |
| isLink | 是否展示右侧箭头并开启点击反馈 | `boolean` | `false` |
| required | 是否显示表单必填星号 | `boolean` | `false` |
| center | 是否使内容垂直居中 | `boolean` | `false` |
| arrowDirection | 箭头方向，可选值为 `left`、`up`、`right`、`down` | `CellArrowDirection` | `right` |
| disabled | 是否禁用点击 | `boolean` | `false` |
| style | 根 Pressable 样式 | `StyleProp<ViewStyle>` | — |
| styles | 语义样式 | `CellStyles` | — |
| onPressDebounceWait | 重复点击的忽略窗口，单位为毫秒 | `number` | — |

Cell 继承 React Native `PressableProps`，但不接收 `children`，且 `style` 使用上表定义的根节点样式。`onPress` 只在传入回调且 Cell 未禁用时触发。

`clickable` 未设置时，会根据 `onPress` 或 `isLink` 自动开启点击反馈；显式设置后以显式值为准。`arrowDirection` 只有在 `isLink` 为 `true` 时才会生效。

### Cell Events

| 事件名      | 说明             | 回调参数                       |
| ----------- | ---------------- | ------------------------------ |
| onPress     | 点击单元格时触发 | `Pressable` press event        |
| onLongPress | 长按单元格时触发 | React Native `Pressable` event |

其他触摸行为和无障碍属性继承 React Native `PressableProps`。

### CellGroup 内容

| 名称     | 说明                              |
| -------- | --------------------------------- |
| children | 自定义分组内容，通常放置多个 Cell |
| title    | 自定义分组标题                    |
| extra    | 自定义标题右侧内容                |

### Cell 语义内容

| 名称  | 说明                         |
| ----- | ---------------------------- |
| title | 自定义左侧标题               |
| value | 自定义右侧内容               |
| label | 自定义标题下方的描述信息     |
| icon  | 自定义左侧图标               |
| extra | 自定义单元格最右侧的额外内容 |

### Cell 分隔线

Cell 内部使用公开的 `Divider` 组件渲染分隔线。需要单独展示分隔线时，可以直接使用 `Divider`，支持 `orientation="vertical"` 和 `inset` 调整左右间距。

### 类型定义

组件导出以下类型定义：

```tsx | pure
import type {
  CellArrowDirection,
  CellGroupProps,
  CellProps,
  CellSemanticStyles,
  CellSize,
  CellStyleInfo,
  CellStyleState,
  CellStyles,
} from '@ftsukic/react-native-ui'
```

## 语义样式

`styles` 可以传对象，也可以传函数。Cell 的函数形式接收 `{ props, state }`，其中 `state` 包含 `pressed` 和 `disabled`；可用 slot 为 `root`、`icon`、`title`、`label`、`value`、`extra` 和 `suffix`。

```tsx | pure
<Cell
  title="通知"
  value="开启"
  styles={({ state }) => ({
    root: { opacity: state.disabled ? 0.5 : 1 },
    title: { color: '#111' },
    value: { color: '#1989FA' },
    suffix: { width: 24 },
  })}
/>
```

`Cell.Group` 的 `styles` 支持 `root`、`title`、`extra` 和 `body`。`style` 与 `styles.root` 都作用于根节点，`style` 的优先级更高。

## 主题定制

通过 `ThemeProvider` 的 `theme.components.Cell` 配置 Cell token：

```tsx | pure
<ThemeProvider
  theme={{
    components: {
      Cell: {
        minHeight: 48,
        activeColor: '#F2F7FF',
        iconColor: '#1989FA',
      },
    },
  }}
>
  <Cell title="主题化单元格" value="查看" isLink />
</ThemeProvider>
```

可覆盖的主要 token 包括 `backgroundColor`、`activeColor`、`borderColor`、`paddingHorizontal`、`paddingVertical`、`minHeight`、`largeMinHeight`、`titleColor`、`labelColor`、`valueColor`、`extraColor`、`iconColor`、`iconSize`、`iconGap`、`requiredColor`、`groupTitleColor` 和 `insetRadius`。

当前不提供 Vant 的 `SwipeCell`（或 `Cell.Swipe`）；滑动操作不属于本组件 API。
