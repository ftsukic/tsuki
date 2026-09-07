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

单选框用于从一组选项中选择一个值，也可以单独作为可控的布尔选择项使用。支持圆形和方形指示器、子节点分组、`options` 分组、禁用状态和主题定制。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Radio } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/standalone.tsx" title="独立 Radio" description="支持受控 checked 和非受控 defaultChecked 两种写法。"></code>

<code src="./__fixtures__/examples/group.tsx" title="Radio.Group 子节点" description="使用子 Radio 自定义选项，支持受控值、默认值、横向布局和间距。"></code>

<code src="./__fixtures__/examples/options.tsx" title="options 分组" description="使用 options 配置数组快速生成结构一致的选项。"></code>

<code src="./__fixtures__/examples/shapes.tsx" title="指示器形状" description="shape 支持 round 和 square，labelPosition 支持左右标签。"></code>

<code src="./__fixtures__/examples/disabled.tsx" title="禁用状态" description="Radio、options 选项和整个 Radio.Group 都支持禁用。"></code>

<code src="./__fixtures__/examples/styled.tsx" title="自定义内容与语义样式" description="children 支持自定义节点，styles 覆盖 root、indicator 和 label。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 theme.components.Radio 统一覆盖组件 token。"></code>

## API

### Radio

支持的类型：

```text
type RadioValue = string | number;
type RadioShape = 'round' | 'square';
type RadioLabelPosition = 'left' | 'right';
```

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 标签内容；支持字符串、数字和自定义节点 |
| value | `string \| number` | — | Group 中的选项值；独立 Radio 可省略 |
| checked | `boolean` | — | 独立 Radio 的受控选中状态 |
| defaultChecked | `boolean` | `false` | 独立 Radio 的初始选中状态 |
| disabled | `boolean` | `false` | 禁用点击和状态变化 |
| shape | `'round' \| 'square'` | `'round'` | 指示器形状 |
| labelPosition | `'left' \| 'right'` | `'right'` | 标签相对于指示器的位置 |
| checkedColor | `ColorValue` | 主题主色 | 选中指示器颜色 |
| onChange | `(checked: boolean) => void` | — | 独立 Radio 选中状态改变时触发 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式 |
| styles | `RadioStyles` | — | `root / indicator / label` 语义样式 |

组件继承 React Native `PressableProps`，`children`、`style` 和 `disabled` 除外。`style` 始终作用于根 Pressable；`styles` 可以是对象或函数，函数接收 `{ props, state: { checked, disabled, pressed } }`。

独立 Radio 只有在从未选中变为选中时触发 `onChange(true)`；再次点击已选中项不会取消选中。需要取消选中时，由上层通过受控 `checked` 改变状态。

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
| direction | `'vertical' \| 'horizontal'` | `'vertical'` | 选项排列方向 |
| gap | `number` | 主题间距 | 选项之间的间距 |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 样式 |

`options` 和 `children` 只能选择一种声明方式；同时传入时开发环境会提示错误，并以 `children` 为渲染来源。Group 是单选行为，选中项不能通过再次点击取消。Group 子 Radio 必须提供 `value`，否则不会参与选择并会在开发环境提示配置错误。

受控模式使用 `value` 和 `onChange`；非受控模式使用 `defaultValue`。Group 的选中状态优先于子 Radio 的 `checked` 和 `defaultChecked`。

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

可覆盖的主要 token 包括 `indicatorSize`、`dotSize`、`borderWidth`、`borderRadius`、`borderColor`、`checkedColor`、`labelColor`、`disabledColor`、`disabledLabelColor`、`fontSize`、`lineHeight`、`gap`、`activeOpacity` 和 `disabledOpacity`。

Radio 暴露 `radio` 无障碍角色和 `selected`、`disabled` 状态；Group 暴露 `radiogroup` 角色。当前不提供多选、取消选中、动画或 options 与 children 混用能力。
