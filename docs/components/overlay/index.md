---
title: Overlay 遮罩层
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Overlay 遮罩层

<section className="component-doc-intro">

## 介绍

Overlay 用于创建全屏遮罩，强调当前操作并阻止用户操作底层内容。支持受控显示、淡入淡出、嵌入内容、遮罩点击和主题定制。

</section>

<code src="../../../src/overlay/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Overlay, Provider } from '@ftsukic/tsuki'
```

Overlay 默认以内联方式渲染，不会自动创建 `Portal`。需要脱离当前布局时，显式使用 `<Portal><Overlay /></Portal>`；应用通常将 `PortalHost` 放在根节点的 `Provider` 中：

```tsx | pure
<Provider>
  <App />
</Provider>
```

## 代码演示

<code src="../../../src/overlay/__fixtures__/examples/basic.tsx" title="基础用法" description="使用 show 受控显示遮罩，点击遮罩后由调用方关闭。"></code>

<code src="../../../src/overlay/__fixtures__/examples/embedded.tsx" title="嵌入内容" description="通过 children 放置自定义内容和交互控件。"></code>

<code src="../../../src/overlay/__fixtures__/examples/interactions.tsx" title="透明遮罩与动画" description="自定义背景色并使用 duration 控制淡入淡出速度。"></code>

<code src="../../../src/overlay/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Overlay token 和 semantic styles 定制外观。"></code>

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
| `style` | `StyleProp<ViewStyle>` | — | 遮罩根节点样式，优先于默认样式 |
| `styles` | `OverlayStyles` | — | `root / content` 语义样式，可传对象或函数 |

组件继承 React Native `ViewProps`，除 `children` 和 `style` 外透传到遮罩根节点。`style` 与 `styles.root` 作用于完整遮罩，`styles.content` 作用于嵌入内容容器。Overlay 不负责脱离布局；需要全屏宿主层时由调用方显式包裹 `Portal`。

遮罩显示时会拦截底层触摸；嵌入内容通过 `children` 放置在遮罩上方，交互组件可以继续响应自己的 `onPress`。Overlay 不提供 Vant Web 专用的 `lockScroll`、`lazyRender`、`customStyle`、`teleport` 和 class API。

### 无障碍与动画

遮罩触摸层不会进入无障碍导航，嵌入内容保持可访问。组件默认只在首次显示后挂载，隐藏时完成淡出动画再卸载；主题设置 `motion: false` 时立即显示或卸载。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.Overlay` 配置默认背景色、动画时长和层级：

```tsx | pure
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
