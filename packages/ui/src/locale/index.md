---
title: LocaleProvider 国际化
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础设施
  order: 2
---

# LocaleProvider 国际化

<section className="component-doc-intro">

## 介绍

LocaleProvider 为 Dialog、ActionSheet 等组件提供默认文案，并允许在子树内覆盖语言分组。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="局部语言" description="通过 LocaleProvider 为子树覆盖组件默认文案。"></code>

## 引入

```tsx | pure
import { LocaleProvider, useLocale } from '@ftsukic/react-native-ui'
```

## API

| 属性/API      | 说明                   | 类型              | 默认值      |
| ------------- | ---------------------- | ----------------- | ----------- |
| `locale`      | 覆盖当前子树的语言字段 | `Partial<Locale>` | 内置 `zhCN` |
| `children`    | 使用语言上下文的内容   | `ReactNode`       | —           |
| `useLocale()` | 读取完整语言对象       | `Locale`          | 当前上下文  |

LocaleProvider 使用浅合并覆盖顶层语言分组；没有 Provider 时 `useLocale` 返回内置中文文案。Locale 只影响组件默认文案，不改变值、布局或主题；不提供 Web `locale` 属性或 DOM 注入。
