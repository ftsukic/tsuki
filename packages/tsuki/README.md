# @ftsukic/tsuki

Tsuki 是面向 iOS 和 Android 的 React Native UI 组件库。

## 安装

```bash
pnpm add @ftsukic/tsuki
```

Tsuki 将 React Native、Gesture Handler、Reanimated、Safe Area Context、SVG 和 Worklets 声明为 peer dependencies。请根据 React Native 或 Expo SDK 选择兼容版本；Expo 应用可以使用 `pnpm exec expo install` 安装原生依赖。

```bash
pnpm exec expo install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
```

## 使用

在应用入口使用 `TsukiProvider`，然后从包根入口导入组件：

```tsx
import { Button, TsukiProvider } from '@ftsukic/tsuki'

export default function App() {
  return (
    <TsukiProvider>
      <Button type="primary">继续</Button>
    </TsukiProvider>
  )
}
```

浮层组件使用 `react-native-teleport`。使用浮层时，请安装 `react-native-teleport`，并在 `TsukiProvider` 外层挂载它的 `PortalProvider`。

## 文档

- [快速开始](https://github.com/ftsukic/tsuki/blob/main/docs/guide/index.md)
- [组件文档](https://github.com/ftsukic/tsuki/tree/main/docs/components)
- [仓库开发指南](https://github.com/ftsukic/tsuki/blob/main/CONTRIBUTING.md)

## License

MIT
