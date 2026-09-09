---
title: 快速开始
order: 0
nav:
  title: 指南
group:
  title: 开发指南
  path: /guide
---

# 快速开始

Tsuki 是一个面向 React Native 和 Expo 的 UI 组件库。

## 安装

```bash
yarn add @ftsukic/tsuki react-native-safe-area-context react-native-svg
```

使用手势或 UI thread 动画能力时，再安装可选 peer dependencies：

```bash
yarn add react-native-gesture-handler react-native-reanimated react-native-worklets
```

如果使用 Expo，请使用 `npx expo install`，让 Expo 根据 SDK 选择匹配版本：

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets
```

### 手势根节点

在业务 App 的入口文件中，确保 Gesture Handler side effect 在应用启动前加载：

```tsx
import 'react-native-gesture-handler'
```

然后由业务 App 在最外层提供根节点，或者让 Provider 按需提供：

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Routes />
    </GestureHandlerRootView>
  )
}
```

默认情况下 Tsuki 只消费 Gesture Handler 能力，不会自动包裹 `GestureHandlerRootView`；使用 `Provider gesture` 时才会由 Provider 提供这个根节点。

如果应用已经使用 `Provider`，也可以开启它的可选 gesture capability：

```tsx
<Provider gesture>
  <Routes />
</Provider>
```

`Provider gesture` 与外部 `GestureHandlerRootView` 二选一即可；默认 `gesture={false}`，不会增加 wrapper。

如果应用需要安全区 inset，可以同样开启 `Provider` 的 `safeArea` capability：

```tsx
<Provider safeArea>
  <Routes />
</Provider>
```

默认 `safeArea={false}`，已有外部 `SafeAreaProvider` 时保持默认值即可。

### Reanimated 配置

RN `0.82+` 使用 Worklets Babel plugin。自定义 Babel 配置时，将 plugin 放在 `plugins` 最后：

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
}
```

不要配置旧的 `react-native-reanimated/plugin`。Reanimated 与 Worklets 版本必须按照当前 RN/Expo 兼容矩阵配对。

## 应用入口

Provider 只需要在应用入口使用一次：

```tsx
import { Provider } from '@ftsukic/tsuki'

export default function App() {
  return (
    <Provider>
      <Routes />
    </Provider>
  )
}
```

组件示例本身不包含 Provider，因此可以直接复用到 Expo demo、测试和业务页面中。

## 使用组件

```tsx | pure
import { Button } from '@ftsukic/tsuki'

export function SubmitButton() {
  return <Button type="primary">提交</Button>
}
```

## 主题定制

使用 `ConfigProvider` 为应用或局部组件树覆盖主题：

```tsx | pure
import { Button, ConfigProvider } from '@ftsukic/tsuki'

export function ThemedButton() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#7232dd' } }}>
      <Button type="primary">自定义主题</Button>
    </ConfigProvider>
  )
}
```
