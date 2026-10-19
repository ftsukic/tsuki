# Teleport Portal 浮层

## 介绍

Tsuki 的弹层直接使用 `react-native-teleport`。应用负责挂载 `PortalProvider`；它会自动提供名为 `root` 的默认宿主。Dialog、Popup、Toast、ActionSheet、Notify、Dropdown、FloatingPanel、FloatingBubble 和 ImagePreview 会将浮层渲染到该宿主。

- [组件预览](../../../src/portal/__fixtures__/overview.tsx)

## 应用入口

```tsx
import { PortalProvider } from 'react-native-teleport'
import { TsukiProvider } from '@ftsukic/tsuki'

export function AppRoot() {
  return (
    <PortalProvider>
      <TsukiProvider>
        <App />
      </TsukiProvider>
    </PortalProvider>
  )
}
```

`PortalProvider` 必须在 `TsukiProvider` 外层。TsukiProvider 为函数式弹层提供 React 承载器；应用无需配置 Tsuki 的 Portal 后端。也可以在 PortalProvider 下自行挂载命名 `PortalHost`，并在直接使用 Teleport Portal 时传入 `hostName`。

`react-native-teleport@1.2.2` 支持 iOS、Android 和 Web，需要在原生应用中启用 Fabric 并重新构建。该迁移移除了 Tsuki 的 JS Portal 回退，因此 Harmony 当前不在支持平台内。

## 代码演示

- [组件式 Portal：使用 Teleport Portal 将内容渲染到 root 宿主。](../../../src/portal/__fixtures__/examples/basic.tsx)

- [父级受控输入：验证 Teleport Portal 中的中文输入、父级赋值、清空和关闭。](../../../src/portal/__fixtures__/examples/controlled-input.tsx)

## 使用 Teleport Portal

```tsx
import { Portal } from 'react-native-teleport'

;<Portal hostName="root">
  <OverlayContent />
</Portal>
```

Tsuki 不再导出自己的 `Portal`、`PortalHost`、`mountPortal`、`updatePortal` 或 `unmountPortal`。如需命令式展示，使用组件提供的函数式 API，例如 `showDialog()`、`showToast()`、`showActionSheet()` 和 `showNotify()`。这些 API 由 TsukiProvider 内部的 React 承载器接入 Teleport；首次调用前，应用必须完成上述 Provider 挂载，否则会抛出明确错误。

命令式弹层统一进入 `root`。直接使用 Teleport 的 Portal 可指定自建宿主的 `hostName`。Portal 会保留来源 React 树的 Context，因此放在 TsukiProvider 下时仍可使用主题等 Tsuki Context。

## 背景滚动锁状态

`useBackgroundScrollLocked(): boolean` 返回当前 TsukiProvider 范围内是否有浮层持有背景滚动锁；Dropdown 使用该锁。页面可将原有滚动条件与 `!locked` 合并后传给 `ScrollView` / `FlatList.scrollEnabled`。所有持有者退出或卸载后才解除滚动锁。
