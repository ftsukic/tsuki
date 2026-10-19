# Tsuki

轻量、可靠、可主题定制的 React Native UI 组件库。

- [快速开始](guide/index.md)
- [组件文档](components/index.md)

## 特性

- **开箱即用**：提供覆盖常见业务场景的 React Native 组件。
- **主题定制**：通过 ConfigProvider 和语义 token 统一调整视觉风格。
- **原生优先**：使用真实 React Native API，同时支持 Expo。

## TsukiProvider

在应用入口包裹一次 `TsukiProvider`，为组件提供主题和 Portal 上下文。单个组件示例不需要重复包裹 TsukiProvider。

```tsx
import { TsukiProvider } from '@ftsukic/tsuki'

export default function App() {
  return (
    <TsukiProvider>
      <AppRoutes />
    </TsukiProvider>
  )
}
```
