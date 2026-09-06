---
title: Button 按钮
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Button 按钮

<section className="component-doc-intro">

## 介绍

按钮用于触发一个操作，例如提交表单、确认或取消。支持多种视觉形式、尺寸和按钮组。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Button, ButtonGroup } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/types.tsx" title="按钮类型" description="通过 type 区分操作的语义。"></code>

<code src="./__fixtures__/examples/variants.tsx" title="视觉变体" description="同一种颜色支持实心、描边、虚线、弱填充和文字形式。"></code>

<code src="./__fixtures__/examples/sizes.tsx" title="按钮尺寸" description="size 控制高度和内边距，large 仍按内容宽度展示。"></code>

<code src="./__fixtures__/examples/shapes.tsx" title="按钮形状" description="square 去除圆角，round 使用胶囊圆角，circle 用于圆形图标按钮。"></code>

<code src="./__fixtures__/examples/disabled.tsx" title="禁用状态" description="disabled 禁用点击并降低透明度。"></code>

<code src="./__fixtures__/examples/loading.tsx" title="加载状态" description="loading 显示加载图标并禁用点击，loadingText 可替换按钮内容。"></code>

<code src="./__fixtures__/examples/icons.tsx" title="图标按钮" description="iconPosition 控制图标位置，纯图标按钮需要无障碍名称。"></code>

<code src="./__fixtures__/examples/block.tsx" title="块级按钮" description="只有 block 主动占满父容器宽度。"></code>

<code src="./__fixtures__/examples/group.tsx" title="按钮组" description="支持紧密拼接、独立间距、整组禁用和等宽排列。"></code>

## API

支持的类型和尺寸：

```text
type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type ButtonSize = 'large' | 'normal' | 'small' | 'mini';
type ButtonVariant = 'solid' | 'filled' | 'outlined' | 'dashed' | 'text';
```

Props 还包括 `color`、`variant`、`plain`、`block`、`round`、`square`、`circle`、`hairline`、`disabled`、`loading`、`loadingText`、`icon`、`iconPosition`、`style` 和 `onPressDebounceWait`。组件继承 React Native `PressableProps`，`style` 始终是 root 样式。

`square` 仅将按钮的 `borderRadius` 设置为 `0`，不会改变按钮的内容宽度或水平内边距。`circle` 会使用当前 `size` 对应的正方形尺寸并裁剪为圆形，适合搭配 `icon` 使用；纯图标按钮应提供 `accessibilityLabel`。

`variant` 控制按钮的视觉形式：`solid` 为实心、`filled` 为弱填充、`outlined` 为细边框、`dashed` 为虚线边框、`text` 为无边框文字按钮。`plain` 仅作为兼容写法，等价于 `variant="outlined"`；同时传入时以 `variant` 为准。当前不提供 `link` variant，链接语义建议使用独立的 `Link` 组件。

### ButtonGroup 按钮组

通过 `ButtonGroup` 或 `Button.Group` 将多个按钮组合排列，每个按钮独立处理 `onPress`，不管理选中值。

| 属性       | 说明                                                        | 默认值    |
| ---------- | ----------------------------------------------------------- | --------- |
| `type`     | 布局类型：`compact` 紧密拼接，`separate` 保留间距和完整外观 | `compact` |
| `gap`      | `separate` 模式的间距                                       | `8`       |
| `size`     | 子按钮的默认尺寸，子按钮显式尺寸优先                        | `normal`  |
| `disabled` | 禁用整组，子按钮不能通过 `disabled={false}` 覆盖            | `false`   |
| `block`    | 整组占满可用宽度，按钮等分                                  | `false`   |

支持标准 `ViewProps`，`style` 作用于组容器。组的 `type` 表示布局；按钮自身的 `type` 和 `variant` 继续控制颜色和视觉形式。

默认横向且不换行。`compact` 仅保留首尾外侧圆角，相邻按钮都有默认边框时移除后一项的起始侧边框。支持直接 Button 子项、数组和条件渲染，单个按钮保留完整外观，空组不渲染；不支持通过 Fragment 或自定义组件包装按钮。自定义按钮 `style` / `styles` 仍可覆盖默认拼接样式。

`size` 统一控制固定高度、字号和左右内边距，普通按钮默认按内容宽度排列；`large` 也不会自动占满父容器。设置 `block` 后宽度为父容器的 `100%`。`circle` 默认宽高相等；显式 `style` 可覆盖尺寸。内容通过 Flex 居中，不使用按钮高度作为文字行高。

## 主题定制

通过 ThemeProvider 的 theme.components.Button 设置高度、内边距和颜色 token；style 设置根节点样式，styles 定制语义区域。

Semantic slots：

```text
<Button
  styles={({ state }) => ({
    root: { marginTop: state.pressed ? 2 : 0 },
    icon: { marginRight: 8 },
    content: { fontWeight: '600' },
  })}
>
  继续
</Button>
```

`styles` 可以是对象或函数，函数可读取 `props` 和 `state.pressed / disabled / loading`。`loading` 会禁用 press，并用 `Loading` 渲染加载状态。首轮不保留 `ghost`、`link`、`textColor`、`textStyle` 等旧 API。
