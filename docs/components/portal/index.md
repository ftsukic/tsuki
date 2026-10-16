---
title: Portal 浮层宿主
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Portal 浮层宿主

<section className="component-doc-intro">

## 介绍

Portal 将内容渲染到当前 `PortalHost` 的宿主层，适合 Popup、Overlay、Dialog、Toast 等需要脱离页面布局的浮层。除了组件式 `Portal`，还提供用于命令式浮层的 `mountPortal`、`updatePortal` 和 `unmountPortal`。

</section>

<code src="../../../src/portal/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import {
  ConfigProvider,
  Portal,
  PortalHost,
  mountPortal,
  unmountPortal,
  updatePortal,
} from '@ftsukic/tsuki'
```

`TsukiProvider` 会自动挂载 `PortalHost`。需要自行组合主题和宿主时，使用 `ConfigProvider` 与 `PortalHost`：

```tsx | pure
<ConfigProvider>
  <PortalHost>
    <App />
  </PortalHost>
</ConfigProvider>
```

## 代码演示

<code src="../../../src/portal/__fixtures__/examples/basic.tsx" title="组件式 Portal" description="使用 Portal 将内容渲染到宿主层。"></code>

<code src="../../../src/portal/__fixtures__/examples/imperative.tsx" title="命令式挂载" description="使用 mountPortal、updatePortal 和 unmountPortal 管理动态内容。"></code>

## API

### Portal

| 属性       | 类型        | 默认值 | 说明                 |
| ---------- | ----------- | ------ | -------------------- |
| `children` | `ReactNode` | —      | 要渲染到宿主层的内容 |

`Portal` 必须渲染在 `PortalHost` 内部，否则会抛出缺少 TsukiProvider / PortalHost 的错误。Portal 会保留当前主题上下文，浮层内容可以继续使用 `useToken` 和组件 token。

### PortalHost

| 属性       | 类型        | 默认值 | 说明                         |
| ---------- | ----------- | ------ | ---------------------------- |
| `children` | `ReactNode` | —      | 宿主下方的页面内容，可以为空 |

同一运行时可以存在多个 `PortalHost`，最近完成挂载的宿主负责新的命令式 entry；该宿主卸载后，恢复使用前一个仍在挂载的宿主。宿主会按挂载顺序渲染 entry，entry 层使用 `pointerEvents="box-none"`，宿主卸载时会清理全部内容。

组件式 Portal 使用组件树中最近的 Host。根 TsukiProvider 的 Host 位于导航页面外，挂载到它的内容不会跟随单个页面的转场或隐藏。需要随页面关闭的常驻浮层，应在页面内提供 Host；页面失焦但仍被导航保留时，由宿主应用卸载相应浮层和局部 Host。Portal 本身不识别导航焦点，命令式宿主选择也不按焦点切换。

独立 `PortalHost` 与 `TsukiProvider` 共用 `portalBackend?: PortalBackend` 配置，只在首次挂载时读取。未配置时继承上层后端；没有上层后端时使用 JS。从 `@ftsukic/tsuki/teleport` 导入 `teleportPortalBackend` 后，使用 `<ConfigProvider><PortalHost portalBackend={teleportPortalBackend}><App /></PortalHost></ConfigProvider>` 可独立启用 Teleport。局部 Host 无需重复配置。`teleport` 已弃用；显式 `teleport={false}` 仍可选择 JS，单独 `true` 需要显式或继承的后端。

### Imperative API

```text
mountPortal(children: ReactNode): PortalKey
updatePortal(key: PortalKey, children: ReactNode): void
unmountPortal(key: PortalKey): void
```

`PortalKey` 是由宿主生成的不透明数字 key。`mountPortal` 没有 active `PortalHost` 时抛出 `PortalHost must be rendered before mounting an imperative portal`；`updatePortal` 和 `unmountPortal` 按 key 找到创建时的宿主，不受 active 宿主切换影响；原宿主卸载或 key 无效时安全无效。

命令式 entry 与组件式 entry 共用同一个宿主层级和挂载顺序。Dialog、Toast 的命令式 API 使用这组函数，因此只需要 `ConfigProvider + PortalHost`，不需要单独的 `DialogProvider` 或 `ToastProvider`。

首次命令式调用需要等待宿主完成挂载：使用 `useEffect` 或后续点击事件，不要在 render、首次 `useLayoutEffect` 或首次 ref 回调中调用。需要在布局阶段显示内容时，使用组件式 `Portal`。命令式 entry 不会随调用方组件自动卸载，调用方应在 effect 清理中释放 key。

```tsx | pure
import { useEffect } from 'react'
import { Text } from 'react-native'
import { mountPortal, unmountPortal } from '@ftsukic/tsuki'

function StartupPortal() {
  useEffect(() => {
    const key = mountPortal(<Text>初始化提示</Text>)
    return () => unmountPortal(key)
  }, [])
  return null
}
```

将 `StartupPortal` 放在 `PortalHost` 内。

组件式 `Portal` 仅桥接调用位置的主题上下文；命令式内容使用目标宿主位置的上下文。其他业务 Context、安全区 Context 或导航 Context 若需要在浮层中使用，应放在 `PortalHost` 外层；局部 TsukiProvider 不会自动随内容迁移。浮层内容也不会继承所在 SwipeCell 的按压归属。

## 背景滚动锁状态

`useBackgroundScrollLocked(): boolean` 返回最近 PortalHost 内浮层持有的背景滚动锁状态；当前 Dropdown 使用该锁。页面应在宿主内部调用 Hook，将原有滚动条件与 `!locked` 合并后传给 `ScrollView` / `FlatList.scrollEnabled`。多个持有者全部退出或卸载后才解除锁；不同 PortalHost 独立，宿主外返回 `false`。

## 父级受控输入验证

<code src="../../../src/portal/__fixtures__/examples/controlled-input.tsx" title="父级受控输入"></code>

Example 在 `EXPO_PUBLIC_TSUKI_PORTAL=teleport` 的原生构建中展示 Teleport 后端；默认运行时显示 JavaScript 后端。该示例将 value 保存在页面父级，用于验证中文拼音组合输入、父级赋值、清空与提交。
