---
title: Provider
order: 2
---

# Provider

`Provider` 是应用级便捷入口，组合提供 `ConfigProvider`、`Portal.Host` 和 Notify。Dialog、Toast、Popup、Overlay 等浮层通过这个 Portal 宿主渲染。

```tsx | pure
import { Provider } from '@ftsukic/react-native-ui'

export function AppRoot() {
  return (
    <Provider>
      <App />
    </Provider>
  )
}
```

主题通过 `theme` 传入：

```tsx | pure
<Provider
  theme={{
    token: { colorPrimary: '#1677ff' },
    components: { Dialog: { borderRadius: 20 } },
  }}
>
  <App />
</Provider>
```

在 Provider 下可以直接使用 `showDialog`、`showToast` 和 `showNotify`。如果不需要 Notify，也可以显式组合：

```tsx | pure
import { ConfigProvider, PortalHost } from '@ftsukic/react-native-ui'

;<ConfigProvider>
  <PortalHost>
    <App />
  </PortalHost>
</ConfigProvider>
```

这组 `ConfigProvider + PortalHost` 已足够使用 Dialog、Toast 及其他受控 Portal 浮层；不再需要单独的 `DialogProvider` 或 `ToastProvider`。

`Provider` 不会自动挂载 `SafeAreaProvider`。如果使用 FloatingPanel 的底部安全区适配，请在应用根部自行挂载 `SafeAreaProvider`，并安装可选 peer dependency `react-native-safe-area-context`。需要自行控制宿主层级的高级场景仍可单独使用 `ConfigProvider`、`Portal.Host` 和 `Portal`。
