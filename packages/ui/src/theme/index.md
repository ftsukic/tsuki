---
title: Theme 主题
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 主题
  order: 3
---

# Theme 主题

<section className="component-doc-intro">

## 介绍

Theme 提供 `SeedToken → MappingAlgorithm → MapToken → AliasToken` 的主题解析链，以及全局 token、组件 token 和嵌套 Provider。组件自己的 token 派生逻辑仍位于组件目录内。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Button, ThemeProvider, darkAlgorithm, useToken } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="全局和组件主题" description="通过 algorithm、token 和 components 覆盖全局主题与 Button token。"></code>

## API

### ThemeProvider Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `theme.token` | 全局 seed、map 或 alias token 的覆盖值 | `ThemeTokenOverrides` | — |
| `theme.algorithm` | 主题映射算法，可传单个或多个算法 | `MappingAlgorithm \| MappingAlgorithm[]` | `defaultAlgorithm` |
| `theme.components` | 组件 token 的覆盖值或派生工厂 | `ComponentTokenOverrides` | — |
| `theme.inherit` | 是否继承外层 ThemeProvider | `boolean` | `true` |
| `children` | 应用内容 | `ReactNode` | — |

```tsx | pure
<ThemeProvider
  theme={{
    algorithm: darkAlgorithm,
    token: { colorPrimary: '#1989FA' },
    components: { Button: { borderRadius: 20 } },
  }}
>
  <Button type="primary">保存</Button>
</ThemeProvider>
```

### Hooks 和工具

| API | 说明 | 边界 |
| --- | --- | --- |
| `useToken()` | 读取当前完整 token、组件 token 和主题配置 | 必须在 `ThemeProvider` 内调用 |
| `useOptionalToken()` | 在没有 Provider 时读取可用的默认 token | 适合基础设施组件，不保证存在外层覆盖 |
| `useComponentToken(name, factory)` | 读取指定组件的 token | 组件名必须是导出的 `ComponentTokenName` |
| `getDesignToken(theme)` | 在 Provider 外解析设计 token | 适合静态样式和测试 |
| `defaultAlgorithm` / `darkAlgorithm` / `compactAlgorithm` | 默认、暗色和紧凑映射算法 | 可通过 `theme.algorithm` 组合 |

`ThemeProvider` 默认继承父级；设置 `inherit: false` 后从默认 seed 开始解析。组件实例的 `theme` 属性（若该组件提供）只覆盖当前组件，不能替代全局 Provider。Theme 不提供业务主题、Web CSS 变量或 DOM 样式注入。
