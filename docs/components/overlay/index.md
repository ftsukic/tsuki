# Overlay 遮罩层

## 介绍

Overlay 用于创建全屏遮罩，强调当前操作并阻止用户操作底层内容。支持受控显示、淡入淡出、嵌入内容、遮罩点击和主题定制。

- [组件预览](../../../src/overlay/__fixtures__/overview.tsx)

## 引入

```tsx
import { Overlay, TsukiProvider } from '@ftsukic/tsuki'
```

Overlay 内部使用 `Portal`，推荐放在应用根节点的 `TsukiProvider` 中：

```tsx
<TsukiProvider>
  <App />
</TsukiProvider>
```

## 代码演示

- [基础用法：使用 show 受控显示遮罩，点击遮罩后由调用方关闭。](../../../src/overlay/__fixtures__/examples/basic.tsx)

- [嵌入内容：通过 children 放置自定义内容和交互控件。](../../../src/overlay/__fixtures__/examples/embedded.tsx)

- [透明遮罩与动画：自定义背景色并使用 duration 控制淡入淡出速度。](../../../src/overlay/__fixtures__/examples/interactions.tsx)

- [主题定制：通过 Overlay token 和 semantic styles 定制外观。](../../../src/overlay/__fixtures__/examples/theme.tsx)

## API

### OverlayProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `show` | `boolean` | `false` | 是否显示；关闭后由调用方更新状态 |
| `backgroundColor` | `ColorValue` | 主题 `colorBgMask` | 遮罩背景色；`transparent` 可创建透明触摸拦截层 |
| `duration` | `number` | 主题值 | 淡入淡出动画时长，单位为毫秒；负数按 `0` 处理，非有限值回退到主题值 |
| `zIndex` | `number` | 主题 `zIndexPopupBase` | 根节点层级 |
| `children` | `ReactNode` | — | 显示在遮罩上方的自定义内容 |
| `onPress` | `PressableProps['onPress']` | — | 点击遮罩区域时触发；不会自动修改 `show` |
| `onClosed` | `() => void` | — | 淡出完成并卸载后触发；关闭被重新打开打断时不触发 |
| `style` | `StyleProp<ViewStyle>` | — | 遮罩根节点样式，优先于默认样式 |
| `styles` | `OverlayStyles` | — | `root / mask / content` 语义样式，可传对象或函数 |

组件继承 React Native `ViewProps`，除 `children` 和 `style` 外透传到遮罩根节点。`style` 与 `styles.root` 作用于根节点，控制整体布局、层级和透明度；`styles.mask` 作用于独立的遮罩 Pressable，控制背景和遮罩外观；`styles.content` 作用于独立的内容 View，控制嵌入内容布局。遮罩与内容是兄弟节点，内容容器使用 `pointerEvents="box-none"`，空白区域可点击遮罩，内容本身不会触发遮罩点击。

这是不兼容调整：原先用于遮罩外观的 `styles.content` 应迁移到 `styles.mask`，原先通过 `style` 或 `styles.root` 设置的遮罩背景应迁移到 `backgroundColor` 或 `styles.mask.backgroundColor`。

遮罩显示时会拦截底层触摸；嵌入内容通过 `children` 放置在遮罩上方，交互组件可以继续响应自己的 `onPress`。Overlay 不提供 Vant Web 专用的 `lockScroll`、`lazyRender`、`customStyle`、`teleport` 和 class API。

### 无障碍与动画

遮罩触摸层不会进入无障碍导航，嵌入内容保持可访问。组件默认只在首次显示后挂载，隐藏时立即禁用触摸并从无障碍导航中隐藏，完成淡出动画再卸载；主题设置 `motion: false` 时立即显示或卸载。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.Overlay` 配置默认背景色、动画时长和层级：

```tsx
<ConfigProvider
  theme={{
    components: {
      Overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        animationDuration: 240,
      },
    },
  }}
>
  <Overlay show />
</ConfigProvider>
```

支持的 Overlay token：`backgroundColor`、`animationDuration` 和 `zIndex`。
