---
title: Form 表单
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Form 表单

<section className="component-doc-intro">

## 介绍

Form 基于 `rc-field-form` 提供受控字段、校验和表单实例能力，使用 `Form.Item` 将输入组件接入字段值。它不负责视觉布局，字段布局由子组件和 React Native 样式决定。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="字段绑定" description="使用 Form.Item 的 name 将 TextInput 接入表单值。"></code>

## 引入

```tsx | pure
import { Form } from '@ftsukic/react-native-ui'
```

## API

### Form

`FormProps<Values>` 继承 `rc-field-form` 的表单配置，组件额外公开 `form?: FormInstance<Values>` 和 `children?: ReactNode`。`component` 被固定为内部实现，不支持作为 DOM 标签传入。

### Form.Item

`FormItemProps<Values>` 继承 `rc-field-form` 的字段配置，默认 `trigger="onChangeText"`、`valuePropName="value"`，因此可直接绑定本库 `TextInput`。需要兼容其他控件时，可以显式设置 `trigger` 与 `valuePropName`。

组件同时导出 `Form.List`、`Form.Provider`、`Form.useForm`、`Form.useWatch`、`FormItemContext` 和 `ListContext`。Form 没有独立主题 token 或 `styles` API，字段样式由 React Native 子组件处理。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
