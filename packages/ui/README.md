# @ftsukic/react-native-ui

基础 React Native UI 组件库。

首轮提供 Provider、Theme、Button、Cell、Cell.Group、Divider、Grid、Space、TextInput、Icon、Loading、Progress、Radio、Avatar、Avatar.Group、Badge、Portal、Overlay、Popup、FloatingPanel、Dialog、Toast 和 Notify。

组件 API 采用 breaking change：使用 Vant Mobile 语义、Ant Design v6 token 分层和 React Native semantic slots，不提供 altron-app 旧 API 兼容层。

```bash
yarn add @ftsukic/react-native-ui
```

该包目标面向 React Native `0.82.1+` 和 React `19.1.1+`。

组件库本身不依赖 HarmonyOS、Expo、Gesture Handler 或 Reanimated。`react-native-svg` 和 `react-native-safe-area-context` 是 peer dependency；宿主应用需要安装它们，并在使用安全区能力时挂载 `SafeAreaProvider`。

应用根节点推荐使用 `Provider`。它统一提供主题、Portal，以及 Dialog、Toast、Notify 的命令式宿主：

```tsx
import { Provider } from '@ftsukic/react-native-ui'

export function AppRoot() {
  return (
    <Provider>
      <App />
    </Provider>
  )
}
```

可以直接调用 `showDialog`、`showToast` 和 `showNotify`，Popup、Overlay 以及受控浮层也会渲染到同一个 Portal 宿主。

不使用 Notify 时，也可以只组合 `ConfigProvider` 和 `PortalHost`：

```tsx
import { ConfigProvider, PortalHost } from '@ftsukic/react-native-ui'

export function AppRoot() {
  return (
    <ConfigProvider>
      <PortalHost>
        <App />
      </PortalHost>
    </ConfigProvider>
  )
}
```

需要自行管理 Portal 的高级场景仍可使用：

```tsx
import { Portal } from '@ftsukic/react-native-ui'

;<Portal>
  <View>浮层内容</View>
</Portal>
```
