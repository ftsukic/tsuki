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

Cell 是通用的 Item 布局原语：`title`/`description` 属于标题区，`value` 属于值区；`titleExtra`、`valueExtra` 和 `trailing` 分别提供相邻扩展与独立右侧内容。它同时支持普通列表的 horizontal 布局和表单项常用的 vertical 布局。

</section>

<code src="../../../src/cell/__fixtures__/overview.tsx" title="组件预览" description="Cell 和 CellGroup 的完整组合用法。"></code>

## 引入

```tsx | pure
import { Cell } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/cell/__fixtures__/examples/basic.tsx" title="基础用法" description="只有 title 的普通 Cell。"></code>

<code src="../../../src/cell/__fixtures__/examples/horizontal.tsx" title="Horizontal" description="title 按内容占位，value 使用剩余空间并支持省略。"></code>

<code src="../../../src/cell/__fixtures__/examples/vertical.tsx" title="Vertical" description="只改变 Main 内部排列，trailing 和 arrow 保持在主体右侧。"></code>

<code src="../../../src/cell/__fixtures__/examples/title-extra.tsx" title="Title extra" description="紧邻 title 的扩展节点。"></code>

<code src="../../../src/cell/__fixtures__/examples/value-extra.tsx" title="Value extra" description="紧邻 value 的扩展节点。"></code>

<code src="../../../src/cell/__fixtures__/examples/value.tsx" title="Value" description="右侧 value 和 valueAlign。"></code>

<code src="../../../src/cell/__fixtures__/examples/label.tsx" title="Description" description="标题下方的辅助文本。"></code>

<code src="../../../src/cell/__fixtures__/examples/long-content.tsx" title="多行内容" description="primitive title/value 的行数控制。"></code>

<code src="../../../src/cell/__fixtures__/examples/icon.tsx" title="Leading" description="左侧任意节点组合。"></code>

<code src="../../../src/cell/__fixtures__/examples/required.tsx" title="Required" description="TitleRow 内的必填标记。"></code>

<code src="../../../src/cell/__fixtures__/examples/link.tsx" title="Link" description="showArrow 展示箭头，事件控制点击反馈。"></code>

<code src="../../../src/cell/__fixtures__/examples/center.tsx" title="Center" description="独立于 vertical 的垂直居中。"></code>

<code src="../../../src/cell/__fixtures__/examples/divider.tsx" title="Divider" description="standalone 与连续 Cell 的显式 divider 控制。"></code>

<code src="../../../src/cell/__fixtures__/examples/large.tsx" title="Size" description="normal 与 large 尺寸。"></code>

<code src="../../../src/cell/__fixtures__/examples/group.tsx" title="CellGroup" description="CellGroup 基础组合。"></code>

<code src="../../../src/cell/__fixtures__/examples/group-title.tsx" title="CellGroup title" description="分组标题。"></code>

<code src="../../../src/cell/__fixtures__/examples/group-inset.tsx" title="CellGroup inset" description="inset 分组容器。"></code>

<code src="../../../src/cell/__fixtures__/examples/disabled.tsx" title="Disabled" description="禁用交互。"></code>

<code src="../../../src/cell/__fixtures__/examples/composition.tsx" title="组合与对齐" description="Avatar、选择控件、多行说明与独立右侧内容。"></code>

<code src="../../../src/cell/__fixtures__/examples/semantic.tsx" title="语义样式" description="CellStyles 插槽。"></code>

<code src="../../../src/cell/__fixtures__/examples/theme.tsx" title="主题定制" description="Cell component token。"></code>

## API

### Cell

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| leading | `ReactNode` | — | 左侧任意节点；Avatar、Checkbox 等通过 ReactNode 组合，尺寸由内容决定。 |
| title | `ReactNode` | — | 标题区主内容。字符串/数字由 Cell 创建内部 `Text`，其他节点原样渲染。 |
| titleExtra | `ReactNode` | — | 紧邻 title 的扩展，属于 `TitleRow`；外层 wrapper 默认垂直居中，自定义节点内部样式由调用方负责。 |
| description | `ReactNode` | — | title 下方的辅助文本。 |
| value | `ReactNode` | — | 值区主内容。字符串/数字由 Cell 创建内部 `Text`，其他节点原样渲染。 |
| valueExtra | `ReactNode` | — | 紧邻 value 的扩展，不会被塞入 value 的自定义节点；外层 wrapper 默认垂直居中，自定义节点内部样式由调用方负责。 |
| trailing | `ReactNode` | — | 独立右侧内容，位于主体之后、箭头之前；默认按自然宽度占位，容器样式可设置 flexShrink / maxWidth。 |
| vertical | `boolean` | `false` | 只将主体内标题区和值区改为纵向；leading、trailing、arrow 仍保持横向。 |
| center | `boolean` | `false` | 一级区域整体垂直居中；默认顶部对齐，与 vertical 相互独立，不控制自定义节点内部排列。 |
| valueAlign | `'left' \| 'center' \| 'right'` | horizontal 为 `'right'`，vertical 为 `'left'` | value 区域的水平对齐；primitive value 同时设置 `Text.textAlign`，自定义节点只控制容器。 |
| required | `boolean` | `false` | 在 TitleRow 内显示必填星号，不增加独立的布局列。 |
| showArrow | `boolean` | `false` | 只显示箭头，不隐式启用点击反馈。 |
| clickable | `boolean` | — | 显式控制点击反馈；未设置时由 onPress 或 onLongPress 推导。 |
| arrowDirection | `'left' \| 'up' \| 'right' \| 'down'` | `'right'` | 箭头方向。 |
| border | `boolean` | `true` | 是否允许当前 Cell 显示底部分割线；`border={false}` 会禁用 divider。未设置 `divider` 时，CellGroup 最后一项不显示内部 divider，standalone Cell 不绘制 divider。 |
| divider | `boolean` | — | 手动覆盖当前 Cell 的底部分割线显示状态，主要用于 RN 下无法获得 Web `:last-child` 语义的 standalone / 自定义布局场景；仍受 `border={false}` 限制。 |
| size | `'normal' \| 'large'` | `'normal'` | 影响 Cell 的 minHeight、padding 和 primitive 文本层级。 |
| titleLines | `number` | — | 只应用于 primitive title。 |
| valueLines | `number` | — | 只应用于 primitive value。 |
| disabled | `boolean` | `false` | 禁用 Pressable 交互并应用 disabled opacity。 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式。 |
| styles | `CellStyles` | — | 按下表定制容器或自动生成文字；支持对象或接收 `{ props, state }` 的纯函数，state 为 pressed / disabled。 |
| onPressDebounceWait | `number` | — | 两次 onPress 之间的最小间隔，单位毫秒。 |

Cell 继承 React Native `PressableProps`，但由 Cell 管理 children、style 和 disabled。onPress、onLongPress、testID 和 accessibility 属性可使用。显式 accessibilityRole 优先；未设置时，交互 Cell 默认 button。disabled 时不触发交互。

内容行按 `leading + 主体 + trailing + arrow` 排列。主体使用剩余宽度，并保留 minWidth: 0；horizontal 时标题区按内容宽度占位、值区使用剩余宽度，vertical 时标题区位于值区上方。默认一级区域顶部对齐，center 时整体居中。小 leading 节点和箭头在自己的首行行高盒内居中，大 Avatar 不会被固定宽高限制。

自定义 ReactNode 原样渲染，不会被 cloneElement 或注入 props；其内部排版、省略和交互由调用方负责。字符串和数字自动创建 Text，数组与 Fragment 中的字符串和数字也递归包装；空数组和空 Fragment 不产生区域或间距。titleLines / valueLines 控制对应区域中每个自动创建的 Text，自定义节点保持原样。titleExtra / valueExtra 保持各自容器内的默认居中；trailing 按自然尺寸占位，窄屏长内容可通过 trailingContainer 设置 maxWidth / flexShrink。

### CellStyles

| 槽位 | 类型 | 职责 |
| --- | --- | --- |
| root | `StyleProp<ViewStyle>` | 根 Pressable，背景、圆角、外部布局；style 指向同一节点。 |
| container | `StyleProp<ViewStyle>` | 内容行，padding、minHeight、一级排列。 |
| leading | `StyleProp<ViewStyle>` | 左侧节点容器。 |
| titleContainer | `StyleProp<ViewStyle>` | 标题与说明区容器。 |
| titleExtraContainer | `StyleProp<ViewStyle>` | 标题相邻扩展容器。 |
| valueContainer | `StyleProp<ViewStyle>` | 值区容器。 |
| valueExtraContainer | `StyleProp<ViewStyle>` | 值相邻扩展容器。 |
| trailingContainer | `StyleProp<ViewStyle>` | 独立右侧内容容器。 |
| arrow | `StyleProp<ViewStyle>` | 箭头容器。 |
| divider | `StyleProp<ViewStyle>` | 底部分割线。 |
| title / description / value | `StyleProp<TextStyle>` | 自动创建的对应文字。 |
| titleExtra / valueExtra / trailing | `StyleProp<TextStyle>` | 自动创建的对应扩展文字；不作用于自定义 ReactNode 内部。 |
| required | `StyleProp<TextStyle>` | 必填标记。 |

默认样式先由 token 派生，再应用 styles，最后应用根 style。按下反馈使用 Pressable 的 pressed 状态：默认按下背景覆盖静态根背景；函数式 styles.root 显式返回 backgroundColor 时可覆盖按下背景。函数式 styles 应保持纯函数，不依赖调用次数。

主体和标题行是私有布局，不提供 main / titleRow 样式槽。容器样式可以覆盖布局默认值；固定宽度、flexShrink 或 alignItems 的定制需要调用方检查窄屏和长内容。

### Cell.Group

`Cell.Group` 也可以通过 named export `CellGroup` 引入。`title` 与 `extra` 位于 cells body 外；Group 只负责集合、inset 容器和最后一项 divider 位置，不识别子元素类型。`border` 仅控制非 inset Group 的顶部/底部 hairline，不影响子 Cell 之间的 divider。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | Cell 子项。 |
| testID | `string` | — | Group 根 View 的测试标识。 |
| title | `ReactNode` | — | body 外的分组标题。 |
| extra | `ReactNode` | — | body 外标题右侧的扩展。 |
| inset | `boolean` | `false` | 使用横向 margin、圆角和裁剪容器。 |
| border | `boolean` | `true` | 仅控制非 inset body 的上下 hairline，不影响子 Cell 之间的 divider。 |
| style | `StyleProp<ViewStyle>` | — | Group 根样式。 |
| styles | `CellGroupSemanticStyles` | — | root、header、extraContainer、body 容器槽，以及 title、extra 自动文字槽。 |

React Native 中需要连续 Cell、但不需要 Group 外边框时，推荐使用 `<Cell.Group border={false}>` 包裹；这样会保留 Cell 之间的 divider，并关闭 Group 上下 hairline。裸的多个 Cell 无法获得 Web `:last-child` 的最后项语义。

divider 的优先级为 `border={false}` 禁用，其次是显式 `divider`，最后才使用 Group position 自动规则：`showDivider = border && (divider ?? autoDivider)`。例如可用 `<Cell divider title="第一项" />` 和 `<Cell title="最后一项" />` 手动模拟连续 Cell。

## 主题定制

`theme.components.Cell` 继续负责 Cell 与 CellGroup 的共享视觉 token，包括 `backgroundColor`、`pressedBackgroundColor`、horizontal/vertical padding、minHeight、divider、字号、icon、title/value 颜色，以及 `verticalGap`、`titleExtraGap`、`valueExtraGap`。

## 不支持的 API

当前不实现依赖 Web DOM 或手势运行时的 Vant `url`、`to`、`iconPrefix`、`titleClass`、`Cell.Swipe` 等 API。

## Breaking migration

本次不保留旧 props 或样式别名。

| 原入口 | 新入口 |
| --- | --- |
| icon / label / extra / isLink | leading / description / trailing / showArrow |
| styles.icon / header / body / content / extra / actions | leading / titleContainer / valueContainer / value / trailing / arrow |

新增 container、titleExtraContainer、valueExtraContainer、trailingContainer，分别控制内容行与扩展节点外层布局。styles.titleExtra / valueExtra 仍是文字槽。showArrow 不再自动开启点击反馈；使用事件或 clickable。默认布局从整行拉伸改为一级区域顶部对齐，center 开启整体居中。Cell.Group 保留 extra prop，新增 header / extraContainer 样式。

Field 的同名展示 props 同步迁移；Picker 类 Field 原 description 帮助文字改为 help，新的 description 表示标题下说明。

相邻扩展间距仅在主内容存在时应用：只有 titleExtra 或 valueExtra 时不添加前置间距。
