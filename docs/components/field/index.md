---
title: Field 表单项
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# Field 表单项

<section className="component-doc-intro">

## 介绍

Field 是带标签和反馈信息的表单输入单元，使用 Cell 作为行布局，默认创建 Input，并允许通过 children 提供自定义控件。它不负责表单校验，状态由调用方通过 Props 控制。

</section>

<code src="../../../src/field/__fixtures__/overview.tsx" title="组件预览" description="Field 汇总默认输入、输入能力透传、标签布局、自定义控件和反馈状态。"></code>

## 引入

```tsx | pure
import { Field } from '@ftsukic/tsuki'

;<Field label="用户名" placeholder="请输入用户名" />
```

## 代码演示

<code src="../../../src/field/__fixtures__/examples/error.tsx" title="错误状态" description="必填 Field 以 errorMessage 展示错误状态。"></code>

<code src="../../../src/field/__fixtures__/examples/basic.tsx" title="基础输入" description="Field 默认创建 Input，直接使用输入相关 Props。"></code>

<code src="../../../src/field/__fixtures__/examples/clearable.tsx" title="可清除" description="clearable 和清除回调透传给内部 Input。"></code>

<code src="../../../src/field/__fixtures__/examples/password.tsx" title="密码输入" description="password 和 clearable 能力透传给内部 Input。"></code>

<code src="../../../src/field/__fixtures__/examples/textarea.tsx" title="多行输入" description="multiline 和 autoSize 输入随内容增长。"></code>

<code src="../../../src/field/__fixtures__/examples/warning.tsx" title="警告状态" description="Field 使用 status=warning 展示辅助提示。"></code>

<code src="../../../src/field/__fixtures__/examples/layout.tsx" title="布局" description="展示 labelWidth、labelAlign 和 colon。"></code>

<code src="../../../src/field/__fixtures__/examples/custom-control.tsx" title="自定义控件" description="children 可以完整替换默认 Input，嵌入 Cell 等自定义控件。"></code>

<code src="../../../src/field/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="展示状态 token 与语义样式插槽。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 自定义控件；存在时完整替换默认 Input，不会克隆或修改其 Props |
| label | `ReactNode` | — | 左侧标签 |
| required | `boolean` | `false` | 在标签前显示必填标记 |
| description | `ReactNode` | — | 内容下方的辅助描述 |
| errorMessage | `ReactNode` | — | 内容下方的错误消息；未传 status 时自动使用 error 状态 |
| status | `'default' \| 'error' \| 'warning'` | `'default'` | 反馈消息的语义状态；传入 errorMessage 且未明确传 status 时自动使用 error |
| labelWidth | `DimensionValue` | `fontSize * 6.2`（默认字号 14 时约 87px） | 标签区域宽度 |
| labelAlign | `'left' \| 'center' \| 'right'` | `'left'` | 标签文字对齐方式 |
| colon | `boolean` | `false` | 是否在标签后显示冒号 |
| inputStyle | `InputProps['style']` | — | 默认输入模式下透传给内部 Input 根节点的样式 |
| inputStyles | `InputStyles` | — | 默认输入模式下透传给内部 Input 的 semantic styles |
| style | `StyleProp<ViewStyle>` | — | Field 根 Cell 节点样式 |
| styles | `FieldStyles` | — | root、row、labelContainer、label、required、content/control、description、error 语义插槽；其中 row 使用 Cell 的行布局，content/control 使用 Field 的 value 区 |

Field 的输入相关 Props 继承并复用 `InputProps`，包括 `value/defaultValue`、`onChangeText`、`formatter`、`clearable`、`type`、`prefix/suffix`、`multiline`、`rows`、`autoSize`、`showWordLimit`、`disabled` 和 `readOnly`。Field 不执行校验，也不引入 `Form` 或 `rc-field-form`。

默认模式下 Field 的 ref 指向内部 `TextInputInstance`，可以调用 `focus()` 和 `blur()`；children 模式不会尝试接管自定义控件的 ref。Field 的 `style/styles` 只控制 Field，`inputStyle/inputStyles` 只控制默认内部 Input。

## 主题定制

Field 使用 Cell 的背景、分割线和行布局，同时通过 `theme.components.Field` 覆盖标签、错误、警告颜色、标签宽度/间距和水平内边距：

```tsx | pure
import { ConfigProvider, Field } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{ components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } } }}
>
  <Field label="手机号" errorMessage="请输入手机号" placeholder="请输入手机号" />
</ConfigProvider>
```
