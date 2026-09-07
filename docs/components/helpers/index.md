---
title: Helpers 工具
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础设施
  order: 2
---

# Helpers 工具

<code src="../../../src/helpers/__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="../../../src/helpers/__fixtures__/examples/basic.tsx" title="工具集合" description="Helpers 是纯函数集合，不直接渲染可视组件。"></code>

Helpers 是无 UI 的纯工具集合，包含文本渲染、组件属性挂载和 easing 辅助函数。

## API

公开工具包括 `getArrowIconName`、`formatDate`、`formatThousandths`、`formatNumber`、`formatDecimal`、`getDefaultValue`、`renderTextLikeJSX`、`attachPropertiesToComponent`、`callInterceptor`、`isObject`、`isPromise`、`getNextZIndex` 和 easing 函数。

`formatNumber` 和 `formatDecimal` 只处理字符串，不负责业务层数值校验；`callInterceptor` 支持同步/异步拦截器，返回 `false` 或解析为 `false` 时调用 `canceled`。这些 API 没有主题、`style` 或无障碍 Props，也不提供 Web DOM 封装。
