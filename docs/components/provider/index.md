---
title: Provider 全局上下文
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础设施
  order: 2
---

# Provider 全局上下文

<code src="../../../src/provider/__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="../../../src/provider/__fixtures__/examples/basic.tsx" title="应用入口" description="Provider 组合主题、语言和 Portal 宿主，为浮层组件提供运行上下文。"></code>

Provider 组合 ThemeProvider、LocaleProvider 和 PortalHost。通过 theme 和 locale 传入全局配置，并使用 children 渲染应用内容。

## API

| 属性       | 说明         | 类型              | 默认值   |
| ---------- | ------------ | ----------------- | -------- |
| `theme`    | 全局主题配置 | `ThemeConfig`     | 默认主题 |
| `locale`   | 全局语言覆盖 | `Partial<Locale>` | 内置中文 |
| `children` | 应用内容     | `ReactNode`       | —        |

Provider 是推荐的应用级入口，会按 ThemeProvider → LocaleProvider → PortalHost 的顺序组合上下文。它不会创建 `SafeAreaProvider`；使用 BottomBar、Popup 或 FloatingPanel 的宿主应用需要自行提供 safe-area context。浮层组件必须挂在该 Provider 或显式 `PortalHost` 下，Provider 没有独立 `style` 或 `styles` API。
