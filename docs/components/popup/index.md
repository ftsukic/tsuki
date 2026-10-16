---
title: Popup 弹出层
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Popup 弹出层

<section className="component-doc-intro">

## 介绍

Popup 用于在当前页面上方展示内容，支持居中、四边定位、遮罩、圆角、懒渲染、销毁和按 Native Stack 语义实现的滑入动画。

</section>

<code src="../../../src/popup/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Popup, TsukiProvider } from '@ftsukic/tsuki'
```

Popup 推荐挂载在应用根节点的 `TsukiProvider` 内：

```tsx | pure
<TsukiProvider>
  <App />
</TsukiProvider>
```

## 代码演示

<code src="../../../src/popup/__fixtures__/examples/basic.tsx" title="基础用法" description="使用 visible 受控显示居中弹层。"></code>

<code src="../../../src/popup/__fixtures__/examples/positions.tsx" title="五种位置" description="支持 center、top、bottom、left 和 right，并按位置处理 round 圆角。"></code>

<code src="../../../src/popup/__fixtures__/examples/safe-area.tsx" title="底部安全区" description="bottom Popup 可将宿主提供的底部 safe-area inset 叠加到面板已有的底部内边距。"></code>

<code src="../../../src/popup/__fixtures__/examples/interactions.tsx" title="遮罩交互" description="通过 overlay、onPressOverlay 和 closeOnPressOverlay 管理遮罩点击。"></code>

<code src="../../../src/popup/__fixtures__/examples/lifecycle.tsx" title="生命周期与销毁" description="观察打开、关闭回调，并使用 destroyOnClosed 销毁内容。"></code>

<code src="../../../src/popup/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Popup token 和 semantic styles 定制浮层。"></code>

<code src="../../../src/popup/__fixtures__/examples/keyboard.tsx" title="输入框与键盘避让"></code>

开启 `keyboardAvoiding` 后，面板在键盘上方的可用区域布局，遮罩仍覆盖整个宿主。居中面板仅在底部被键盘遮挡时上移，底部面板贴近键盘上沿，顶部面板保持顶部位置。避让使用独立的 Reanimated 位移，并采用键盘事件的时长。该能力位于 Portal 内；仅在页面外包裹 KeyboardAvoidingView 无法保证作用于弹层。

Popup 限制面板可用高度，长内容需要调用方提供可收缩的 ScrollView，并将固定按钮放在滚动区域外。 Android 宿主窗口被键盘缩小时，按实际布局与键盘的重叠区域避让；不要同时叠加业务侧键盘高度。宿主应覆盖需要避让的页面区域，嵌套或带偏移的 PortalHost 需要单独验证。Web 和 Harmony 的软键盘行为需要在目标宿主验证。

## API

### PopupProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `keyboardAvoiding` | `boolean` | `false` | 是否在 Portal 内为面板避让软键盘 |
| visible | `boolean` | `false` | 是否显示；Popup 是受控组件 |
| position | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'center'` | 弹出位置 |
| overlay | `boolean` | `true` | 是否显示全屏遮罩；遮罩默认拦截底层触摸 |
| closeOnPressOverlay | `boolean` | `false` | 点击遮罩时是否发出 `onRequestClose` 请求 |
| safeAreaInsetBottom | `boolean` | `false` | `position="bottom"` 时是否把 `SafeAreaInsetsContext` 的 bottom inset 叠加到面板已有的底部内边距 |
| onPressOverlay | `(event) => void` | — | 点击遮罩回调 |
| onRequestClose | `() => void` | — | 关闭请求回调，也用于 Android 返回键；调用方应更新 `visible` |
| duration | `number` | 主题 `animationDuration` | 动画毫秒数；非正数按 `0` 处理 |
| round | `boolean` | `false` | 使用主题圆角；四边定位只裁剪靠近内容中心的一侧 |
| lazyRender | `boolean` | `true` | 初次显示前不挂载 children |
| destroyOnClosed | `boolean` | `false` | 关闭动画完成后是否卸载 children |
| zIndex | `number` | 主题 `zIndex` | Popup 宿主层级 |
| style | `StyleProp<ViewStyle>` | — | 全屏根节点样式，最后合并 |
| styles | `PopupStyles` | — | `root`、`container`、`mask`、`wrapper` 语义样式；支持对象或函数。 |
| onOpen | `() => void` | — | 开始打开动画时回调 |
| onOpened | `() => void` | — | 打开动画完成时回调 |
| onClose | `() => void` | — | 开始关闭动画时回调 |
| onClosed | `() => void` | — | 关闭动画完成时回调 |

组件还继承 React Native `ViewProps`（`children` 和 `style` 除外），其余 View props 会透传到面板，并且 ref 指向面板 root。`style` 和 `styles.root` 作用于全屏根节点；`styles.wrapper` 作用于定位层，`styles.container` 作用于面板，`styles.mask` 作用于遮罩。

面板的 `opacity` 和 `transform` 由 Motion 驱动；`styles.container.opacity` 作为动画目标透明度，`transform` 不用于覆盖动画。`styles.mask` 只应用到遮罩视觉层，其透明度与共享动画进度相乘。`styles.wrapper` 保留用于定位层定制。

启用底部安全区后，按 `paddingBottom`、`paddingBlockEnd`、`paddingBlock`、`paddingVertical`、`padding` 的优先级读取已有 padding，再叠加 bottom inset。百分比 padding 按定位层宽度解析；首次测量前使用窗口宽度。

Popup 不会自动修改 `visible`。`closeOnPressOverlay` 和 Android 返回键都只是发出 `onRequestClose`，需要由父组件设置 `visible={false}`。未提供 `onRequestClose` 时 Android 返回键返回 `false`，继续交给更底层的返回处理器。

`center` 面板按内容尺寸布局；`top` 和 `bottom` 默认占满可用宽度；`left` 和 `right` 默认占满可用高度。使用 `styles.container` 可以覆盖面板尺寸。方向面板使用从对应边缘滑入/滑出的动画，居中面板使用淡入和轻微缩放；遮罩与面板由同一个 transition progress 同步驱动。动画运行时快速切换 `visible` 会从当前进度继续。

`lazyRender` 只控制首次挂载；关闭后默认保留内容状态，`destroyOnClosed` 会在关闭动画完成后卸载内容。若动画被新的 `visible` 状态中断，不会触发被取消的完成回调。

面板继承调用方传入的无障碍属性。隐藏及退出期间，根节点会隐藏整个无障碍子树；再次显示时恢复导航。遮罩不进入无障碍元素导航；需要明确语义时，应在 children 上提供 `accessible`、`accessibilityRole` 和 `accessibilityLabel`。

首版不支持 `closeable`、`beforeClose`、`lockScroll`、safe-area top、imperative API、Web `teleport`、HTML 字符串和自定义 transition 名称。`safeAreaInsetBottom` 只对 `position="bottom"` 生效；没有 `SafeAreaProvider` 或 bottom inset 时按 `0` 处理。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Popup` 配置：

| Token             | 默认值               | 说明                                               |
| ----------------- | -------------------- | -------------------------------------------------- |
| backgroundColor   | `colorBgContainer`   | 面板背景色                                         |
| overlayColor      | `colorBgMask`        | 遮罩背景色                                         |
| borderRadius      | `borderRadiusLG`     | `round` 使用的圆角                                 |
| animationDuration | `motionDurationSlow` | 动画时长，单位毫秒；默认与 Vant 的 `0.3s` 过渡一致 |
| zIndex            | `zIndexPopupBase`    | Popup 宿主默认层级                                 |

`theme.seed.motion=false` 时动画时长强制为 `0`，但生命周期回调仍按打开/关闭顺序触发。`styles` 支持对象或函数；函数接收 `{ props, state: { visible, position, rendered } }`。

## 动画

面板和遮罩复用 Motion 浮层 preset 与共享进度。遵循 `TsukiProvider motion` 的全局开关、Reduced Motion 和时长倍率；快速切换从当前进度继续，退出完成后才执行 `destroyOnClosed`。

### Portal 内的受控输入

编辑状态应由弹层内挂载的表单组件持有：传入 `<Form />`，并在 Form 内使用 `useState` 驱动 `Input.value`。若状态放在 Portal 外，每次输入的 value 更新需要经由 Portal 内容转发，原生输入框可能在中间提交收到旧值并打断组合输入。外层通过 ref 读取草稿或调用表单的赋值、重置方法；不要在每个字符输入时同步更新外层 state 后再传回 value。
