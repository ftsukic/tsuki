---
title: Checkbox 复选框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Checkbox 复选框

<section className="component-doc-intro">

## 介绍

Checkbox 用于多选，使用边框、主题色背景和 `CheckOutlined` 图标表达选中状态。组件支持独立受控/非受控状态、`Checkbox.Group` 多选，以及不包装 `Button` 的 `variant="button"` 样式。button variant 隐藏 indicator，使用内容自适应宽度，并保留 Checkbox 的多选切换行为。

</section>

<code src="../../../src/checkbox/__fixtures__/overview.tsx" title="组件预览" description="Checkbox 的基础、多选分组、button variant 和主题示例。"></code>

## 引入

```tsx | pure
import { Checkbox } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/checkbox/__fixtures__/examples/basic.tsx" title="基础状态" description="受控、非受控、禁用、左右标签和 shape。"></code>

<code src="../../../src/checkbox/__fixtures__/examples/group.tsx" title="Checkbox.Group" description="使用 name 管理多个选项并通过 onChange 得到数组值。"></code>

<code src="../../../src/checkbox/__fixtures__/examples/button.tsx" title="Button checkbox" description="展示 button variant 的独立和分组用法。"></code>

<code src="../../../src/checkbox/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Checkbox component token 定制尺寸、间距和选中背景。"></code>

## API

### Checkbox

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 标签内容；字符串和数字使用库内文本样式，自定义节点由调用方控制 |
| name | `string \| number` | — | `Checkbox.Group` 中的选项名；Group 子 Checkbox 必须提供 |
| checked | `boolean` | — | 独立 Checkbox 的受控选中状态；在 Group 中由 Group 的 `value` 决定 |
| defaultChecked | `boolean` | `false` | 独立 Checkbox 的非受控初始状态 |
| disabled | `boolean` | `false` | 禁用点击和状态变化；Group 的 `disabled` 会覆盖子项 |
| onChange | `(checked: boolean) => void` | — | 状态切换后回调；受控组件仍由上层更新 `checked` |
| iconSize | `number` | Checkbox token.size | 普通 checkbox 指示器尺寸 |
| shape | `'round' \| 'square'` | `'round'` | `round` 使用圆形外框，`square` 使用主题圆角方框；不提供 Radio 的 `dot` |
| labelPosition | `'left' \| 'right'` | `'right'` | 标签相对于 checkbox 指示器的位置 |
| variant | `'default' \| 'button'` | `'default'` | `button` 隐藏 indicator，使用按钮边框和背景，但仍由 Checkbox 自己渲染和管理状态；宽度由内容和水平 padding 撑开 |
| style | `StyleProp<ViewStyle>` | — | 根 `InteractionPressable` 节点样式，优先级高于默认样式和 `styles.root` |
| styles | `CheckboxStyles` | — | `root`、`indicator`、`label` 三个语义样式插槽，也支持函数形式 |
| onPressDebounceWait | `number` | — | 两次点击之间的最小间隔，单位为毫秒 |

组件继承 React Native `PressableProps`，但由组件管理 `children`、`style`、`disabled` 和 `onPress` 的状态分发。整个 Checkbox 区域（包括 label）都可以点击；disabled 时不响应。默认无障碍角色为 `checkbox`，并同步 `accessibilityState.checked` 与 `accessibilityState.disabled`。

### Checkbox.Group

`Checkbox.Group` 与 named export `CheckboxGroup` 等价，通过子 Checkbox 的 `name` 管理多选数组。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 直接传入带 `name` 的 Checkbox 子项 |
| value | `readonly (string \| number)[]` | — | 受控选中名称数组 |
| defaultValue | `readonly (string \| number)[]` | `[]` | 非受控初始选中名称数组 |
| onChange | `(value: (string \| number)[]) => void` | — | 数组改变后回调；添加和移除都返回新的数组 |
| disabled | `boolean` | `false` | 禁用整个 Group，并覆盖子 Checkbox 的启用设置 |
| direction | `'vertical' \| 'horizontal'` | `'vertical'` | 子项排列方向 |
| gap | `number` | Checkbox token.groupGap | 子项间距 |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 样式 |

Group 不提供 `options`、`multiple` 或 `max` 兼容层；RN API 直接使用 children + name 的多选模型。Group 子项缺少 `name` 时不会参与选择，并在开发环境提示配置错误。

### Checkbox token

通过 `ConfigProvider` 的 `theme.components.Checkbox` 覆盖 token。核心字段包括 `size`、`borderRadius`、`borderColor`、`checkedBackground`、`checkedIconColor`、`disabledColor`、`disabledBackground`、`labelColor`、`gap`、`groupGap`、`activeOpacity` 和 `disabledOpacity`；button variant 还使用 `buttonHeight`、`buttonPaddingHorizontal`、`buttonBorderRadius`、`buttonBackground` 和 `buttonDisabledBackground`。

```tsx | pure
import { Checkbox, ConfigProvider } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Checkbox: { size: 24, checkedBackground: '#07c160' } } }}>
  <Checkbox defaultChecked>主题化 Checkbox</Checkbox>
</ConfigProvider>
```

当前不提供 Web 专属的 `className`、HTML 属性、CSS 图标 slot 或 Radio 的 dot 指示器；自定义 React 节点应通过 `children` 完成。
