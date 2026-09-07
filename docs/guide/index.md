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
