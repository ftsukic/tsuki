---
title: Radio 单选框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Radio 单选框

<section className="component-doc-intro">

## 介绍

单选框用于从一组选项中选择一个值，也可以单独作为可控的布尔选择项使用。支持 Vant 语义的圆形 check、方形 check 和中心圆点指示器、Ant Design 风格的 `button` 变体、子节点分组、`options` 分组、禁用状态和主题定制。

</section>

<code src="../../../src/radio/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Radio } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/radio/__fixtures__/examples/standalone.tsx" title="独立 Radio" description="支持受控 checked 和非受控 defaultChecked 两种写法。"></code>

<code src="../../../src/radio/__fixtures__/examples/group.tsx" title="Radio.Group 子节点" description="使用子 Radio 自定义选项，支持受控值、默认值、横向布局和间距。"></code>

<code src="../../../src/radio/__fixtures__/examples/button.tsx" title="Button Radio" description="button 变体隐藏指示器，默认使用内容自适应宽度，并保留 Group 单选行为。"></code>

<code src="../../../src/radio/__fixtures__/examples/options.tsx" title="options 分组" description="使用 options 配置数组快速生成结构一致的选项。"></code>

<code src="../../../src/radio/__fixtures__/examples/shapes.tsx" title="指示器形状" description="shape 支持 round 和 square，labelPosition 支持左右标签。"></code>

<code src="../../../src/radio/__fixtures__/examples/disabled.tsx" title="禁用状态" description="Radio、options 选项和整个 Radio.Group 都支持禁用。"></code>

<code src="../../../src/radio/__fixtures__/examples/styled.tsx" title="自定义内容与语义样式" description="children 支持自定义节点，styles 覆盖 root、indicator 和 label。"></code>

<code src="../../../src/radio/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 theme.components.Radio 统一覆盖组件 token。"></code>

## API

### Radio

支持的类型：

```text
type RadioValue = string | number;
type RadioShape = 'round' | 'square' | 'dot';
type RadioVariant = 'default' | 'button';
type RadioLabelPosition = 'left' | 'right';
```

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 标签内容；支持字符串、数字和自定义节点 |
| value | `string \| number` | — | Group 中的选项值；独立 Radio 可省略 |
| checked | `boolean` | — | 独立 Radio 的受控选中状态 |
| defaultChecked | `boolean` | `false` | 独立 Radio 的初始选中状态 |
| disabled | `boolean` | `false` | 禁用点击和状态变化 |
| shape | `'round' \| 'square' \| 'dot'` | `'round'` | `round` 为圆形 checked indicator + check，`square` 为方形 checked indicator + check，`dot` 为圆形外圈 + 中心圆点 |
| variant | `'default' \| 'button'` | `'default'` | `button` 隐藏 radio indicator，使用内容宽度的按钮容器；仍保持 Radio 的单选逻辑 |
| labelPosition | `'left' \| 'right'` | `'right'` | 标签相对于指示器的位置 |
| checkedColor | `ColorValue` | 主题主色 | 选中指示器颜色 |
| onChange | `(checked: boolean) => void` | — | 独立 Radio 选中状态改变时触发 |
| style | `StyleProp<ViewStyle>` | — | 根 `InteractionPressable` 样式 |
| styles | `RadioStyles` | — | `root / indicator / label` 语义样式 |

组件继承 React Native `PressableProps`，`children`、`style` 和 `disabled` 除外。`style` 始终作用于根 `InteractionPressable`；`styles` 可以是对象或函数，函数接收 `{ props, state: { checked, disabled, pressed } }`。

独立 Radio 只有在从未选中变为选中时触发 `onChange(true)`；再次点击已选中项不会取消选中。需要取消选中时，由上层通过受控 `checked` 改变状态。

`variant="button"` 隐藏 indicator，默认使用内容加水平 padding 的自适应宽度容器。选中状态改变背景、边框和文字颜色，但不显示 check icon；Group 仍保持互斥选择，已选项不能通过再次点击取消。需要等宽按钮时，在 Group 上设置 `buttonLayout="equal"`；FieldRadio 的 button 选项默认使用该布局。

`shape="round"` 是默认形状，选中后显示白色 check；`shape="square"` 使用方形 checked indicator 并显示白色 check；`shape="dot"` 保持透明圆形外圈，仅在内部显示 `dotSize` 大小的 checkedColor 圆点。

### Radio.Group

通过 `Radio.Group` 或 `RadioGroup` 管理一组选项的单选值。`Radio.Group` 是 `RadioGroup` 的 compound API。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | `Radio` 子项；适合自定义标签和内容 |
| options | `readonly RadioOption[]` | — | 配置式选项；每项包含 `value`、`label` 和可选 `disabled` |
| value | `string \| number` | — | 受控选中值 |
| defaultValue | `string \| number` | — | 非受控初始选中值 |
| onChange | `(value: RadioValue) => void` | — | 选中值改变时触发 |
| disabled | `boolean` | `false` | 禁用整个 Group，并覆盖子项的启用设置 |
| variant | `'default' \| 'button'` | `'default'` | 统一设置子 Radio 的显示模式；`button` 同时适用于 `children` 和 `options` |
| direction | `'vertical' \| 'horizontal'` | `'vertical'` | 选项排列方向 |
| gap | `number` | 主题间距 | 选项之间的间距 |
| buttonLayout | `'intrinsic' \| 'equal'` | `'intrinsic'` | `equal` 使用 Grid 等宽布局；仅当所有直接子项都是 button variant 时生效 |
| buttonColumns | `number` | `5` | `equal` 横向布局时每行最多的列数；超出后自动换行 |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 样式 |

`options` 和 `children` 只能选择一种声明方式；同时传入时开发环境会提示错误，并以 `children` 为渲染来源。Group 是单选行为，选中项不能通过再次点击取消。Group 子 Radio 必须提供 `value`，否则不会参与选择并会在开发环境提示配置错误。

受控模式使用 `value` 和 `onChange`；非受控模式使用 `defaultValue`。Group 的选中状态优先于子 Radio 的 `checked` 和 `defaultChecked`。

`Radio.Group variant` 会透传给子 Radio 和 `options` 自动生成的 Radio。子 Radio 显式设置 `variant` 时，以子 Radio 的设置为准；可运行的 children、options 和等宽换行示例见上方 Button Radio fixture。

`buttonLayout="equal"` 会使用 Grid 作为纯布局容器。横向 `buttonColumns={5}` 时，8 个 button option 会按 5+3 换行，并保持两行按钮宽度一致；等宽按钮标签保持单行，过长文本按原生 Text 默认方式省略；普通 Group 默认仍是内容自适应宽度。

## 语义样式

```tsx
<Radio
  styles={({ state }) => ({
    root: { padding: 8 },
    indicator: { borderWidth: state.checked ? 2 : 1 },
    label: { color: state.disabled ? '#999' : '#1989FA' },
  })}
>
  继续接收通知
</Radio>
```

`style` 和 `styles.root` 都作用于根节点，`style` 的优先级更高；`styles.indicator` 只覆盖指示器容器，`styles.label` 只覆盖文本标签。自定义 `children` 节点的内部样式由调用方控制。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Radio` 配置组件 token：

```tsx
<ConfigProvider
  theme={{
    components: {
      Radio: {
        indicatorSize: 24,
        checkedColor: '#07C160',
        gap: 10,
      },
    },
  }}
>
  <Radio defaultChecked>主题化 Radio</Radio>
</ConfigProvider>
```

可覆盖的主要 token 包括 `indicatorSize`、`dotSize`、`borderWidth`、`borderRadius`、`borderColor`、`checkedColor`、`labelColor`、`disabledBorderColor`、`disabledBackgroundColor`、`disabledCheckedBackgroundColor`、`disabledMarkColor`、`disabledLabelColor`、`fontSize`、`lineHeight`、`gap`、`activeOpacity`、`disabledOpacity`，以及 button variant 的 `buttonHeight`、`buttonPaddingHorizontal`、`buttonBorderRadius`、`buttonBackground`、`buttonDisabledBackground` 和 `buttonCheckedLabelColor`。

Radio 暴露 `radio` 无障碍角色和 `selected`、`disabled` 状态；Group 暴露 `radiogroup` 角色。当前不提供多选、取消选中、动画或 options 与 children 混用能力。
