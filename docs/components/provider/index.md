---
title: TsukiProvider 全局上下文
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础设施
  order: 2
---

# TsukiProvider 全局上下文

<code src="../../../src/provider/__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="../../../src/provider/__fixtures__/examples/basic.tsx" title="应用入口" description="TsukiProvider 组合主题和 Portal 宿主，为浮层组件提供运行上下文。"></code>

<code src="../../../src/provider/__fixtures__/examples/gesture.tsx" title="默认手势根节点" description="TsukiProvider 默认通过 GestureHandlerRootView 为手势内容提供根节点。"></code>

<code src="../../../src/provider/__fixtures__/examples/safe-area.tsx" title="启用安全区根节点" description="通过 safeArea 选项为安全区内容提供 SafeAreaProvider。"></code>

TsukiProvider 组合 `SafeAreaProvider`、`GestureHandlerRootView`、`ConfigProvider`、`SwipeCellManager` 和 `PortalHost`。`GestureHandlerRootView` 默认启用，以便 SwipeCell 等手势组件开箱即用；通过 `gesture={false}` 可以显式关闭。通过 `theme` 传入全局主题配置，并使用 `children` 渲染应用内容。设置 `safeArea` 后，会增加对应的安全区根节点。

## API

| 属性       | 说明                                    | 类型           | 默认值       |
| ---------- | --------------------------------------- | -------------- | ------------ |
| `theme`    | 全局主题配置                            | `ThemeConfig`  | 默认主题     |
| `motion`   | 动画开关、Reduced Motion 与时长倍率     | `MotionConfig` | 默认动画策略 |
| `gesture`  | 初始化时是否提供 Gesture Handler 根节点 | `boolean`      | `true`       |
| `safeArea` | 初始化时是否提供 Safe Area 根节点       | `boolean`      | `false`      |
| `children` | 应用内容                                | `ReactNode`    | —            |

TsukiProvider 是推荐的应用级入口，会按可选 `SafeAreaProvider` → 默认 `GestureHandlerRootView` → `ConfigProvider` → `SwipeCellManager` → `PortalHost` 的顺序组合上下文。`gesture={false}` 可在宿主已经提供根节点时关闭内部 root。`KeyboardProvider` 和导航等其它业务运行时能力仍应由宿主应用组合。浮层组件必须挂在该 TsukiProvider 或显式 `PortalHost` 下，TsukiProvider 没有独立 `style` 或 `styles` API。

`gesture`、`safeArea` 以及独立 `GestureProvider` / `SafeAreaProvider` 的 `enabled` 只在首次挂载时读取；挂载后修改不会切换根节点或重置子树状态。需要改变根节点组合时，请通过新的 `key` 显式重新挂载 TsukiProvider。`theme`、`motion` 仍支持运行时更新。

多个 TsukiProvider 可以同时存在。新的命令式浮层挂载到最近完成挂载的 PortalHost；已有浮层的更新和关闭始终使用创建时的宿主。该宿主卸载后，对旧 key 的操作安全无效。

## 可选 Teleport 后端

默认使用 JS Portal，无需安装 Teleport。启用时安装 `react-native-teleport@^1.2.2`，从独立入口导入适配器：

```tsx | pure
import { TsukiProvider } from '@ftsukic/tsuki'
import { teleportPortalBackend } from '@ftsukic/tsuki/teleport'

;<TsukiProvider portalBackend={teleportPortalBackend}>
  <App />
</TsukiProvider>
```

`portalBackend` 只在首次挂载时读取。Provider 与独立 PortalHost 共用初始化逻辑；局部 Host 默认继承上层后端，不重复初始化后端 Provider。独立入口可使用 `<PortalHost portalBackend={teleportPortalBackend}>`。声明式浮层保留来源 React 树；命令式 API 保留 key 和宿主所有权管理。

`teleport` 已弃用。显式适配器优先于该属性；单独 `teleport={true}` 且没有可继承的后端时会抛出迁移提示，`teleport={false}` 仍选择 JS。请将旧 `<TsukiProvider teleport>` 改成上述显式配置。

iOS/Android 必须启用 Fabric 并重新构建 App（iOS 需更新 Pods）；Expo Go 不包含该原生模块。Harmony 不应导入 Teleport 入口。Web 可以使用 Teleport 的 Web 实现。

Example 已安装 Teleport，通过 `EXPO_PUBLIC_TSUKI_PORTAL=teleport yarn example:dev` 启用。切换后端后需要完整重新加载。

`Provider` 和 `ProviderProps` 保留为弃用别名，请改用 `TsukiProvider` 和 `TsukiProviderProps`。
