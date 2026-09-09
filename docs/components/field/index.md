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

Field 为输入控件提供统一的标签、必填标记、描述和错误/警告状态布局。它不负责表单校验，状态由调用方通过 Props 控制。

</section>

<code src="../../../src/field/__fixtures__/overview.tsx" title="组件预览" description="Field 汇总标签、必填标记、描述、错误和警告状态。"></code>

## 引入

```tsx | pure
import { Field, Input } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/field/__fixtures__/examples/error.tsx" title="错误状态" description="必填 Field 以 errorMessage 展示错误状态。"></code>

<code src="../../../src/field/__fixtures__/examples/warning.tsx" title="警告状态" description="Field 使用 status=warning 展示辅助提示。"></code>

<code src="../../../src/field/__fixtures__/examples/layout.tsx" title="布局" description="展示 labelWidth、labelAlign 和 colon。"></code>

<code src="../../../src/field/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="展示状态 token 与语义样式插槽。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 输入控件或其他表单内容 |
| label | `ReactNode` | — | 左侧标签 |
| required | `boolean` | `false` | 在标签前显示必填标记 |
| description | `ReactNode` | — | 内容下方的辅助描述 |
| errorMessage | `ReactNode` | — | 内容下方的错误消息；未传 status 时自动使用 error 状态 |
| status | `'default' \| 'error' \| 'warning'` | `'default'` | 标签和反馈消息的语义状态 |
| labelWidth | `DimensionValue` | — | 标签区域宽度 |
| labelAlign | `'left' \| 'center' \| 'right'` | `'left'` | 标签文字对齐方式 |
| colon | `boolean` | `false` | 是否在标签后显示冒号 |
| style | `StyleProp<ViewStyle>` | — | Field 根节点样式 |
| styles | `FieldStyles` | — | root、row、labelContainer、label、required、content、description、error 语义插槽 |

Field 继承 React Native `ViewProps`，不克隆或修改 children 的 Props。它只提供布局和文本展示，不额外设置 accessibility role 或 label；输入控件的无障碍语义由子组件和调用方负责。Field 的 `errorMessage` 只负责展示，不执行规则校验，也不引入 `rc-field-form`。

## 主题定制

通过 `theme.components.Field` 覆盖标签、错误、警告颜色以及默认高度和内边距：

```tsx | pure
import { ConfigProvider, Field, Input } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{ components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } } }}
>
  <Field label="手机号" errorMessage="请输入手机号">
    <Input placeholder="请输入手机号" />
  </Field>
</ConfigProvider>
```
