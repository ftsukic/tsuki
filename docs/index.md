---
hero:
  title: Tsuki
  description: 轻量、可靠、可主题定制的 React Native 组件库
  actions:
    - text: 快速开始 →
      link: /guide
    - text: 查看组件
      link: /components
features:
  - title: 开箱即用
    emoji: 🧳
    description: 提供覆盖常见业务场景的 React Native 组件。
  - title: 主题定制
    emoji: 🎨
    description: 通过 ConfigProvider 和语义 token 统一调整视觉风格。
  - title: 原生优先
    emoji: 📱
    description: 使用真实 React Native API，同时支持 Expo 和 Web 文档预览。
---

<div className="tsuki-home-section">

## 组件预览

所有组件示例来自源码旁的 canonical fixtures，文档和 Expo demo 共用同一份实现。

</div>

<div className="tsuki-home-section">

## Provider

在应用入口包裹一次 `Provider`，为组件提供主题和 Portal 上下文。单个组件示例不需要重复包裹 Provider。

```tsx | pure
import { Provider } from '@ftsukic/tsuki'

export default function App() {
  return (
    <Provider>
      <AppRoutes />
    </Provider>
  )
}
```

</div>
