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

<code src="../../../src/provider/__fixtures__/examples/basic.tsx" title="应用入口" description="Provider 组合主题和 Portal 宿主，为浮层组件提供运行上下文。"></code>

<code src="../../../src/provider/__fixtures__/examples/gesture.tsx" title="启用手势根节点" description="通过 gesture 选项为手势内容提供 GestureHandlerRootView。"></code>

<code src="../../../src/provider/__fixtures__/examples/safe-area.tsx" title="启用安全区根节点" description="通过 safeArea 选项为安全区内容提供 SafeAreaProvider。"></code>

Provider 组合 `SafeAreaProvider`、`GestureHandlerRootView`、`ConfigProvider`、`InteractionCoordinator` 和 `PortalHost`；前两项均可选。通过 `theme` 传入全局主题配置，并使用 `children` 渲染应用内容。设置 `safeArea` 或 `gesture` 后，会增加对应的根节点。

## API

| 属性       | 说明                            | 类型          | 默认值   |
| ---------- | ------------------------------- | ------------- | -------- |
| `theme`    | 全局主题配置                    | `ThemeConfig` | 默认主题 |
| `gesture`  | 是否提供 Gesture Handler 根节点 | `boolean`     | `false`  |
| `safeArea` | 是否提供 Safe Area 根节点       | `boolean`     | `false`  |
| `children` | 应用内容                        | `ReactNode`   | —        |

Provider 是推荐的应用级入口，会按可选 `SafeAreaProvider` → 可选 `GestureHandlerRootView` → `ConfigProvider` → `InteractionCoordinator` → `PortalHost` 的顺序组合上下文。已有外部 root 时保持对应 Provider 选项默认值即可。`KeyboardProvider` 和导航等其它业务运行时能力仍应由宿主应用组合。浮层组件必须挂在该 Provider 或显式 `PortalHost` 下，Provider 没有独立 `style` 或 `styles` API。
