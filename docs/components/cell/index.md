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

Cell 用于列表中的信息展示和导航操作，提供与 Vant Cell / CellGroup 对齐的布局、尺寸、分割线和 inset 容器语义。

</section>

<code src="../../../src/cell/__fixtures__/overview.tsx" title="组件预览" description="Cell 和 CellGroup 的 Vant 基线用法预览。"></code>

## 引入

```tsx | pure
import { Cell, Icon } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/cell/__fixtures__/examples/basic.tsx" title="Basic Cell" description="展示只有标题的基础 Cell。"></code>

<code src="../../../src/cell/__fixtures__/examples/value.tsx" title="Value" description="展示右侧 value 的默认对齐方式。"></code>

<code src="../../../src/cell/__fixtures__/examples/icon.tsx" title="Icon" description="展示左侧 icon 与标题、value 的组合。"></code>

<code src="../../../src/cell/__fixtures__/examples/label.tsx" title="Label" description="展示标题下方的 label 辅助信息。"></code>

<code src="../../../src/cell/__fixtures__/examples/large.tsx" title="Large" description="比较 normal 与 large 的 padding 和字体层级。"></code>

<code src="../../../src/cell/__fixtures__/examples/link.tsx" title="Link" description="展示 isLink 默认点击反馈和箭头。"></code>

<code src="../../../src/cell/__fixtures__/examples/required.tsx" title="Required" description="展示必填标记。"></code>

<code src="../../../src/cell/__fixtures__/examples/center.tsx" title="Center" description="展示 center 对多行 Cell 内容的垂直对齐。"></code>

<code src="../../../src/cell/__fixtures__/examples/group.tsx" title="CellGroup" description="展示没有 title 的 CellGroup body。"></code>

<code src="../../../src/cell/__fixtures__/examples/group-title.tsx" title="CellGroup title" description="展示位于 CellGroup body 外的 group title。"></code>

<code src="../../../src/cell/__fixtures__/examples/group-inset.tsx" title="CellGroup inset" description="展示 inset margin、圆角和裁剪层级。"></code>

## 扩展案例

<code src="../../../src/cell/__fixtures__/examples/disabled.tsx" title="Disabled extension" description="展示本库 extension disabled 对普通 Cell 和链接 Cell 的禁用语义。"></code>

<code src="../../../src/cell/__fixtures__/examples/extra.tsx" title="extra extension" description="展示本库 extension extra 在 CellGroup header 右侧的用法。"></code>

<code src="../../../src/cell/__fixtures__/examples/semantic.tsx" title="语义样式" description="展示 Cell semantic slots 的可运行样式定制。"></code>

<code src="../../../src/cell/__fixtures__/examples/theme.tsx" title="主题定制" description="展示通过 ConfigProvider 覆盖 Cell component token。"></code>

## API

### Cell

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | `ReactNode` | — | 左侧图标节点；推荐使用 `Icon` |
| title | `ReactNode` | — | 标题内容；与 `label` 一起放在左侧 flex 列 |
| label | `ReactNode` | — | 标题下方的辅助说明，normal 为 12px，large 为 14px |
| value | `ReactNode` | — | 右侧值内容，与 title 列各占一个可收缩的 flex 列 |
| extra | `ReactNode` | — | 本库 extension，追加在 value 后的内容；不是 Vant Cell 核心 prop |
| center | `boolean` | `false` | `false` 保留多行内容的顶部语义，`true` 将 value、icon 和 suffix 相对整块内容垂直居中 |
| isLink | `boolean` | `false` | 显示右侧箭头；未显式设置 `clickable` 时同时启用点击反馈 |
| clickable | `boolean` | — | 显式控制 active 点击反馈；传入 `false` 时覆盖 `isLink` 的默认可点击语义 |
| border | `boolean` | `true` | 显示当前 Cell 的底部 hairline；`CellGroup` 最后一个 Cell 始终不显示内部 divider |
| required | `boolean` | `false` | 显示必填标记 |
| arrowDirection | `'right' \| 'left' \| 'up' \| 'down'` | `'right'` | `isLink` 箭头方向 |
| size | `'normal' \| 'large'` | `'normal'` | large 使用更大的垂直 padding、title 字号和 label 字号 |
| disabled | `boolean` | `false` | 本库 extension；禁用 press 并应用禁用透明度 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式，优先级高于默认样式和 `styles.root` |
| styles | `CellStyles` | — | `root`、`row`、`content`、`valueContainer`、`icon`、`title`、`label`、`value`、`extra`、`suffix`、`required`、`divider` 语义样式 |
| onPressDebounceWait | `number` | — | 两次 `onPress` 之间的最小间隔，单位为毫秒 |

Cell 继承 React Native `PressableProps`，但由组件管理 `children`、`style` 和 `disabled`。交互 Cell 的默认无障碍语义为 `accessibilityRole="button"`；`isLink` 默认带 active feedback，显式 `clickable={false}` 会关闭反馈。`onPress` 仍由调用方提供，`disabled` 时不会触发。

normal 的基线为横向 16、纵向 10、title/value 14、label 12、label 上间距 4；large 的纵向 padding 为 12、title 为 16、label 为 14。title 和 value 均为 `flex: 1`，因此只有 title、只有 value、长 title 与长 value 都不会依赖固定的 value 最小宽度。

默认 `center={false}` 时，多行 Cell 的 value 从标题行顶部开始；设置 `center` 后，value、icon 和右侧箭头才相对整块内容垂直居中。Cell 的内部 hairline 由库内 Divider 基础能力承载，仍由 `border`、CellGroup 位置和 Cell component token 控制，调用方不需要单独配置。

### Cell.Group

`Cell.Group` 也可以通过 named export `CellGroup` 引入。`title` 和 `extra` header 位于 cells body 外；只有 body 负责背景、inset 横向 margin、radius 和 overflow。CellGroup 只负责 Cell 集合；需要组合 Grid 时，应将 CellGroup 和 Grid 作为 Surface 的并列子元素。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | Cell 子项；Group 使用位置 context 管理最后一个 divider |
| title | `ReactNode` | — | Group 标题，位于 body 外；对齐 Vant CellGroup title |
| extra | `ReactNode` | — | 本库 extension，header 右侧内容；不是 Vant CellGroup 核心 prop |
| inset | `boolean` | `false` | body 使用 16 横向 margin、8 radius 和 clipped overflow；不添加完整边框 |
| border | `boolean` | `true` | 非 inset body 显示 top/bottom hairline；inset 不添加外圈 border |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 样式 |
| styles | `CellGroupSemanticStyles` | — | `root`、`title`、`extra`、`body` 语义样式 |

非 inset Group 的 border 只负责上下 hairline，Cell 之间的内部 divider 仍由每个 Cell 的 `border` 控制。inset Group 的最后一个 Cell 不显示内部 divider。Group 不会识别子元素类型，也不透传 Cell props。

## 语义样式

`styles.root` 和 `style` 作用于根 Pressable，`style` 优先级更高。`row`、`content`、`valueContainer`、`required` 和 `divider` 可覆盖 Cell 的内部布局节点，其余 slots 覆盖对应内容节点；自定义 `ReactNode` 的内部样式由调用方控制。Group 的 `styles.body` 只覆盖 cells body，适合调整 body 的背景或容器样式。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Cell` 覆盖 Cell 和 CellGroup 共用的 component token：

Cell token 包括 normal / large padding 和字号、label 间距、divider / Group hairline、Group title padding、inset margin / radius，以及 `backgroundColor`、`activeColor`、`titleColor` 等语义颜色。dark theme 和 component override 都通过 `useComponentToken` 生效。

当前不实现 `Cell.Swipe`、Web DOM attributes、`url`、`to`、`iconPrefix`、`titleClass` 或其他依赖浏览器/手势运行时的 Vant API。
