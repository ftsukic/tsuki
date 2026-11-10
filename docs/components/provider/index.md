# TsukiProvider 全局上下文

- **基础示例** [示例源码](../../../src/provider/__fixtures__/overview.tsx)

## 示例源码

- **应用入口**：TsukiProvider 组合主题和 Portal 宿主，为浮层组件提供运行上下文。 [示例源码](../../../src/provider/__fixtures__/examples/basic.tsx)

- **默认手势根节点**：TsukiProvider 默认通过 GestureHandlerRootView 为手势内容提供根节点。 [示例源码](../../../src/provider/__fixtures__/examples/gesture.tsx)

- **启用安全区根节点**：通过 safeArea 选项为安全区内容提供 SafeAreaProvider。 [示例源码](../../../src/provider/__fixtures__/examples/safe-area.tsx)

TsukiProvider 组合 `SafeAreaProvider`、`GestureHandlerRootView`、`ConfigProvider`、`SwipeCellManager` 和 `PortalHost`。`GestureHandlerRootView` 默认启用，以便 SwipeCell 等手势组件开箱即用；通过 `gesture={false}` 可以显式关闭。通过 `theme` 传入全局主题配置，并使用 `children` 渲染应用内容。设置 `safeArea` 后，会增加对应的安全区根节点。

## API

| 属性            | 说明                                    | 类型            | 默认值       |
| --------------- | --------------------------------------- | --------------- | ------------ |
| `theme`         | 全局主题配置                            | `ThemeConfig`   | 默认主题     |
| `motion`        | 动画开关、Reduced Motion 与时长倍率     | `MotionConfig`  | 默认动画策略 |
| `gesture`       | 初始化时是否提供 Gesture Handler 根节点 | `boolean`       | `true`       |
| `safeArea`      | 初始化时是否提供 Safe Area 根节点       | `boolean`       | `false`      |
| `portalBackend` | 显式自定义 Portal 后端，首次挂载时固定  | `PortalBackend` | JS Portal    |
| `children`      | 应用内容                                | `ReactNode`     | —            |

TsukiProvider 是推荐的应用级入口，会按可选 `SafeAreaProvider` → 默认 `GestureHandlerRootView` → `ConfigProvider` → `SwipeCellManager` → `PortalHost` 的顺序组合上下文。`gesture={false}` 可在宿主已经提供根节点时关闭内部 root。`KeyboardProvider` 和导航等其它业务运行时能力仍应由宿主应用组合。浮层组件必须挂在该 TsukiProvider 或显式 `PortalHost` 下，TsukiProvider 没有独立 `style` 或 `styles` API。

`gesture`、`safeArea` 以及独立 `GestureProvider` / `SafeAreaProvider` 的 `enabled` 只在首次挂载时读取；挂载后修改不会切换根节点或重置子树状态。需要改变根节点组合时，请通过新的 `key` 显式重新挂载 TsukiProvider。`theme`、`motion` 仍支持运行时更新。

多个 TsukiProvider 可以同时存在。新的命令式浮层挂载到最近完成挂载的 PortalHost；已有浮层的更新和关闭始终使用创建时的宿主。该宿主卸载后，对旧 key 的操作安全无效。

## Portal 后端选择

未设置 `portalBackend` 时，TsukiProvider 按平台自动选择后端：

| 平台                                          | 默认后端  |
| --------------------------------------------- | --------- |
| iOS、Android、Web、Harmony、Windows、其他平台 | JS Portal |

后端只在首次挂载时读取。所有平台默认使用 Tsuki 的 JavaScript Portal，不需要安装 `react-native-teleport`，也不需要为 Portal 启用 Fabric。`portalBackend` 仅用于显式指定自定义后端。

Provider 与独立 PortalHost 共用初始化逻辑；局部 Host 未设置时继承上层后端，不重复初始化后端 Provider。`portalBackend` 也可传给独立 `<PortalHost portalBackend={customBackend}>`。声明式浮层保留来源 React 树；命令式 API 保留 key 和宿主所有权管理。

直接运行 `yarn example:dev` 即可在所有平台使用 JavaScript Portal。

`Provider` 和 `ProviderProps` 保留为弃用别名，请改用 `TsukiProvider` 和 `TsukiProviderProps`。
