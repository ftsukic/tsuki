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

Cell 是通用的 Item 布局原语：`title`/`label` 属于标题区，`value` 属于值区；`titleExtra`、`valueExtra` 和 `extra` 分别提供相邻扩展与 trailing action。它同时支持普通列表的 horizontal 布局和表单项常用的 vertical 布局。

</section>

<code src="../../../src/cell/__fixtures__/overview.tsx" title="组件预览" description="Cell 和 CellGroup 的完整组合用法。"></code>

## 引入

```tsx | pure
import { Cell } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/cell/__fixtures__/examples/basic.tsx" title="基础用法" description="只有 title 的普通 Cell。"></code>

<code src="../../../src/cell/__fixtures__/examples/horizontal.tsx" title="Horizontal" description="title/value 的横向 Main 布局。"></code>

<code src="../../../src/cell/__fixtures__/examples/vertical.tsx" title="Vertical" description="只改变 Main 内部排列，extra 和 arrow 保持 trailing。"></code>

<code src="../../../src/cell/__fixtures__/examples/title-extra.tsx" title="Title extra" description="紧邻 title 的扩展节点。"></code>

<code src="../../../src/cell/__fixtures__/examples/value-extra.tsx" title="Value extra" description="紧邻 value 的扩展节点。"></code>

<code src="../../../src/cell/__fixtures__/examples/value.tsx" title="Value" description="右侧 value 和 valueAlign。"></code>

<code src="../../../src/cell/__fixtures__/examples/label.tsx" title="Label" description="标题下方的辅助文本。"></code>

<code src="../../../src/cell/__fixtures__/examples/long-content.tsx" title="多行内容" description="primitive title/value 的行数控制。"></code>

<code src="../../../src/cell/__fixtures__/examples/icon.tsx" title="Icon" description="左侧 icon 组合。"></code>

<code src="../../../src/cell/__fixtures__/examples/required.tsx" title="Required" description="TitleRow 内的必填标记。"></code>

<code src="../../../src/cell/__fixtures__/examples/link.tsx" title="Link" description="isLink、arrow 和点击反馈。"></code>

<code src="../../../src/cell/__fixtures__/examples/center.tsx" title="Center" description="独立于 vertical 的垂直居中。"></code>

<code src="../../../src/cell/__fixtures__/examples/large.tsx" title="Size" description="normal 与 large 尺寸。"></code>

<code src="../../../src/cell/__fixtures__/examples/group.tsx" title="CellGroup" description="CellGroup 基础组合。"></code>

<code src="../../../src/cell/__fixtures__/examples/group-title.tsx" title="CellGroup title" description="分组标题。"></code>

<code src="../../../src/cell/__fixtures__/examples/group-inset.tsx" title="CellGroup inset" description="inset 分组容器。"></code>

<code src="../../../src/cell/__fixtures__/examples/disabled.tsx" title="Disabled" description="禁用交互。"></code>

<code src="../../../src/cell/__fixtures__/examples/semantic.tsx" title="语义样式" description="CellStyles 插槽。"></code>

<code src="../../../src/cell/__fixtures__/examples/theme.tsx" title="主题定制" description="Cell component token。"></code>

## API

### Cell

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | `ReactNode` | — | 左侧图标或自定义节点。 |
| title | `ReactNode` | — | 标题区主内容。字符串/数字由 Cell 创建内部 `Text`，其他节点原样渲染。 |
| titleExtra | `ReactNode` | — | 紧邻 title 的扩展，属于 `TitleRow`。 |
| label | `ReactNode` | — | title 下方的辅助文本。 |
| value | `ReactNode` | — | 值区主内容。字符串/数字由 Cell 创建内部 `Text`，其他节点原样渲染。 |
| valueExtra | `ReactNode` | — | 紧邻 value 的扩展，不会被塞入 value 的自定义节点。 |
| extra | `ReactNode` | — | Item 级 trailing slot，位于 Main 之后、arrow 之前。 |
| vertical | `boolean` | `false` | 只将 Main 内的 titleArea/valueArea 改为纵向；外层 Row、icon、extra、arrow 仍保持横向。 |
| center | `boolean` | `false` | Item 内部元素的垂直居中；与 `vertical` 相互独立。 |
| valueAlign | `'left' \| 'center' \| 'right'` | horizontal 为 `'right'`，vertical 为 `'left'` | value 区域的水平对齐；primitive value 同时设置 `Text.textAlign`，自定义节点只控制容器。 |
| required | `boolean` | `false` | 在 TitleRow 内显示必填星号，不增加独立的布局列。 |
| isLink | `boolean` | `false` | 显示 arrow；未显式设置 `clickable` 时启用点击反馈。 |
| clickable | `boolean` | — | 显式控制 active 点击反馈。 |
| arrowDirection | `'left' \| 'up' \| 'right' \| 'down'` | `'right'` | `isLink` arrow 方向。 |
| border | `boolean` | `true` | 显示底部 divider；CellGroup 最后一项不显示内部 divider。 |
| size | `'normal' \| 'large'` | `'normal'` | 影响 Cell 的 minHeight、padding 和 primitive 文本层级。 |
| titleLines | `number` | — | 只应用于 primitive title。 |
| valueLines | `number` | — | 只应用于 primitive value。 |
| disabled | `boolean` | `false` | 禁用 Pressable 交互并应用 disabled opacity。 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式。 |
| styles | `CellStyles` | — | 语义样式插槽。 |
| onPressDebounceWait | `number` | — | 两次 `onPress` 之间的最小间隔，单位为毫秒。 |

Cell 继承 React Native `PressableProps`，但由 Cell 管理 `children`、`style` 和 `disabled`；`onPress`、`testID`、无障碍和其他 Pressable 属性仍可使用。交互 Cell 默认 `accessibilityRole="button"`。`disabled` 时不触发 `onPress`。

Cell 的内部结构固定为 `row -> icon + main + extra + suffix`。horizontal 时 Main 内部是 `titleArea | valueArea`，vertical 时只改变 Main 为 `titleArea` 换行到 `valueArea` 上方。自定义 ReactNode 不会被 `cloneElement`，也不会被注入任何 props。

### CellStyles

`styles` 可使用 `root`、`row`、`main`、`titleArea`、`titleRow`、`title`、`titleExtra`、`label`、`valueArea`、`value`、`valueExtra`、`extra`、`icon`、`required`、`suffix`、`divider`。`title/value/titleExtra/valueExtra/label/extra` 是文本插槽时使用 `TextStyle`；容器插槽使用 `ViewStyle`。自定义 ReactNode 的内部样式仍由调用方负责。

### Cell.Group

`Cell.Group` 也可以通过 named export `CellGroup` 引入。`title` 与 `extra` 位于 cells body 外；Group 只负责集合、inset 容器和最后一项 divider 位置，不识别子元素类型。

| 属性     | 类型                      | 默认值  | 说明                                    |
| -------- | ------------------------- | ------- | --------------------------------------- |
| children | `ReactNode`               | —       | Cell 子项。                             |
| testID   | `string`                  | —       | Group 根 View 的测试标识。              |
| title    | `ReactNode`               | —       | body 外的分组标题。                     |
| extra    | `ReactNode`               | —       | body 外标题右侧的扩展。                 |
| inset    | `boolean`                 | `false` | 使用横向 margin、圆角和裁剪容器。       |
| border   | `boolean`                 | `true`  | 控制非 inset body 的上下 hairline。     |
| style    | `StyleProp<ViewStyle>`    | —       | Group 根样式。                          |
| styles   | `CellGroupSemanticStyles` | —       | `root`、`title`、`extra`、`body` 插槽。 |

## 主题定制

`theme.components.Cell` 继续负责 Cell 与 CellGroup 的共享视觉 token，包括背景、active 背景、horizontal/vertical padding、minHeight、divider、字号、icon、title/value 颜色，以及 `verticalGap`、`titleExtraGap`、`valueExtraGap`。

## 不支持的 API

当前不实现依赖 Web DOM 或手势运行时的 Vant `url`、`to`、`iconPrefix`、`titleClass`、`Cell.Swipe` 等 API。
