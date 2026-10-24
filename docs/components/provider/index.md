# TsukiProvider 全局上下文

- [组件预览](../../../src/provider/__fixtures__/overview.tsx)

## 代码演示

- [应用入口：TsukiProvider 组合主题与手势等 Tsuki 上下文。](../../../src/provider/__fixtures__/examples/basic.tsx)

- [默认手势根节点：TsukiProvider 默认通过 GestureHandlerRootView 为手势内容提供根节点。](../../../src/provider/__fixtures__/examples/gesture.tsx)

- [启用安全区根节点：通过 safeArea 选项为安全区内容提供 SafeAreaProvider。](../../../src/provider/__fixtures__/examples/safe-area.tsx)

TsukiProvider 组合可选 `SafeAreaProvider`、默认启用的 `GestureHandlerRootView`、`ConfigProvider` 和函数式弹层的 React 承载器。应用需在其外层提供 `react-native-teleport` 的 `PortalProvider`，由应用负责 Portal 宿主生命周期。SwipeCell 的单开与外部触摸关闭由页面接入 `useSwipeCellDismiss()`，TsukiProvider 不再安装 SwipeCell manager 或重置其局部按压作用域。

## API

| 属性       | 说明                                    | 类型           | 默认值       |
| ---------- | --------------------------------------- | -------------- | ------------ |
| `theme`    | 全局主题配置                            | `ThemeConfig`  | 默认主题     |
| `motion`   | 动画开关、Reduced Motion 与时长倍率     | `MotionConfig` | 默认动画策略 |
| `gesture`  | 初始化时是否提供 Gesture Handler 根节点 | `boolean`      | `true`       |
| `safeArea` | 初始化时是否提供 Safe Area 根节点       | `boolean`      | `false`      |
| `children` | 应用内容                                | `ReactNode`    | —            |

```tsx
import { PortalProvider } from 'react-native-teleport'
import { TsukiProvider } from '@ftsukic/tsuki'

;<PortalProvider>
  <TsukiProvider>
    <App />
  </TsukiProvider>
</PortalProvider>
```

`gesture`、`safeArea` 只在首次挂载时读取；挂载后修改不会切换根节点或重置子树状态。`theme`、`motion` 支持运行时更新。`KeyboardProvider`、导航等其它运行时能力仍由宿主应用组合。

`Provider` 和 `ProviderProps` 保留为弃用别名，请改用 `TsukiProvider` 和 `TsukiProviderProps`。
