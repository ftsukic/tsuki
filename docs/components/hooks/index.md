---
title: Hooks 通用钩子
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础设施
  order: 2
---

# Hooks 通用钩子

<code src="../../../src/hooks/__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="../../../src/hooks/__fixtures__/examples/basic.tsx" title="通用钩子" description="Hooks 通过组件 API 使用，不直接渲染界面。"></code>

Hooks 提供受控值、持久化回调、防抖和更新时机等通用能力。

## API

| Hook                   | 说明                                                    |
| ---------------------- | ------------------------------------------------------- |
| `useControllableValue` | 在受控 `value` 和非受控 `defaultValue` 之间统一读写状态 |
| `usePersistFn`         | 保持函数引用稳定，同时调用最新实现                      |
| `useDebounceFn`        | 提供带 `run`、`cancel` 和 `flush` 的防抖函数            |
| `useUpdateEffect`      | 与 `useEffect` 相同，但跳过首次渲染                     |

这些 Hook 只能在 React 组件或自定义 Hook 中调用，遵守 React Hooks 规则；它们没有独立主题、样式或 React Native Props。
