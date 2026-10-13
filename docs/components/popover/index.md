---
title: Popover 气泡弹出框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 反馈组件
  order: 4
---

# Popover 气泡弹出框

<section className="component-doc-intro">

## 介绍

Popover 用于在触发控件附近展示 Vant 风格的操作菜单，也支持完全自定义浮层内容。组件使用 `react-native-popover-view` 处理 React Native 的定位、箭头、屏幕边界、旋转和键盘适配。

</section>

<code src="../../../src/popover/__fixtures__/overview.tsx" title="组件预览" description="Popover 的 action 菜单、定位、主题、触发器和自定义内容预览。"></code>

## 引入

```tsx | pure
import { Popover } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/popover/__fixtures__/examples/basic.tsx" title="基础用法" description="点击触发器打开包含三个 action 的菜单，并显示最后选择的 action。"></code>

<code src="../../../src/popover/__fixtures__/examples/theme.tsx" title="深色风格" description="比较 light 和 dark 两种 Popover 自身视觉主题。"></code>

<code src="../../../src/popover/__fixtures__/examples/placement.tsx" title="弹出位置" description="验证 auto、top、bottom、left 和 right 五种位置。"></code>

<code src="../../../src/popover/__fixtures__/examples/icon.tsx" title="图标" description="在 action 中组合图标，并为单项设置颜色。"></code>

<code src="../../../src/popover/__fixtures__/examples/disabled.tsx" title="禁用选项" description="展示禁用 action 和禁用 Popover 触发器。"></code>

<code src="../../../src/popover/__fixtures__/examples/horizontal.tsx" title="横向排列" description="使用 actionsDirection 横向排列 action。"></code>

<code src="../../../src/popover/__fixtures__/examples/controlled.tsx" title="受控模式" description="使用 visible、onVisibleChange 和 manual trigger 管理可见状态。"></code>

<code src="../../../src/popover/__fixtures__/examples/custom-content.tsx" title="自定义内容" description="使用 content 替换 action 菜单，并从自定义内容内部关闭浮层。"></code>

<code src="../../../src/popover/__fixtures__/examples/semantic.tsx" title="语义样式" description="通过 semantic styles 定制 reference、container 和 item 插槽。"></code>

<code src="../../../src/popover/__fixtures__/examples/theme-token.tsx" title="主题 token" description="通过 ConfigProvider 覆盖 Popover component token。"></code>

## API

### Popover

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactElement` | — | reference / trigger；不会同时承担 popup content 语义 |
| accessibilityLabel | `string` | children 的 label | 自动触发器的无障碍标签；`manual` 时由 children 自行维护 |
| actions | `readonly PopoverAction[]` | `[]` | Vant 风格 action 菜单；`content` 存在时不渲染 |
| content | `ReactNode` | — | 完全自定义浮层内容，优先级高于 `actions` |
| visible | `boolean` | 非受控 | 受控可见状态；传入后由调用方作为唯一状态源 |
| defaultVisible | `boolean` | `false` | 非受控模式的初始可见状态 |
| trigger | `'press' \| 'longPress' \| 'manual'` | `'press'` | 自动触发方式；`manual` 不绑定自动打开事件 |
| placement | `'auto' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'floating'` | `'bottom'` | 浮层位置；不支持 `*-start` / `*-end` |
| theme | `'light' \| 'dark'` | `'light'` | Popover 自身的视觉主题，不替代 ConfigProvider 的主题算法 |
| actionsDirection | `'vertical' \| 'horizontal'` | `'vertical'` | action 菜单方向 |
| disabled | `boolean` | `false` | 禁止 trigger 打开；不会覆盖受控 `visible` |
| offset | `number` | `8` | reference 与浮层之间的距离，负数按 `0` 处理 |
| showArrow | `boolean` | `true` | 是否显示箭头 |
| overlay | `boolean` | `false` | 是否使用由 Popover token 提供的遮罩颜色 |
| closeOnAction | `boolean` | `true` | 选择 action 后是否关闭 |
| closeOnPressOutside | `boolean` | `true` | 点击浮层外部后是否关闭 |
| duration | `number` | `300` | 打开和关闭动画时长，单位为毫秒；全局关闭 motion 时为 `0` |
| style | `StyleProp<ViewStyle>` | — | popup content 根节点样式；不会作用于 trigger wrapper |
| styles | `PopoverStyles` | — | `reference`、`root`、`container`、`content`、`mask`、`list`、`item`、`itemIcon`、`itemContent`、`divider` 语义样式；支持对象或函数。 |
| onSelect | `(action, index) => void` | — | action 被选择后的回调；禁用 action 不触发 |
| onVisibleChange | `(visible) => void` | — | 所有内部打开/关闭请求的状态回调 |
| onOpen | `() => void` | — | 打开动画开始时触发 |
| onOpened | `() => void` | — | 打开动画完成时触发 |
| onClose | `() => void` | — | 关闭动画开始时触发 |
| onClosed | `() => void` | — | 关闭动画完成时触发 |

Popover 不整体继承 `react-native-popover-view` 的 Props，也不提供第三方的 `mode`、`popoverShift`、`arrowShift` 等实现细节。`children` 的原有样式、事件、无障碍标签和角色会保留。Button、Pressable、Text、原生 Touchable，以及提供 `onPress` / `onLongPress` 的自定义组件，在原控件上合并触发事件；自定义组件需要把事件转发到真实交互节点。普通 `View`、Fragment 和没有交互事件的自定义展示组件使用可测量的 Pressable reference，支持点击、长按和无障碍激活。自动触发器补充 `expanded` 状态及 `activate` action；`manual` 不注入事件或无障碍属性。包含独立交互控件的自定义组件应转发触发事件，或使用 `manual` 自行管理。

`visible` 传入 `undefined` 之外的值时为受控模式。触发器、action 和 outside press 的请求都经过同一状态边界；受控模式只调用 `onVisibleChange`，不会在 Popover 内部篡改 `visible`。父组件拒绝一次请求后，后续独立操作仍可再次请求打开或关闭。`onClosed` 由底层引擎实际关闭完成事件触发，不通过固定延时推算；重新打开后忽略旧会话的关闭完成回调。退出期间内容不接收点击，也从无障碍树隐藏。

### PopoverAction

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| text | `ReactNode` | — | action 文本或自定义节点 |
| icon | `ReactNode` | — | action 左侧图标；默认图标槽位为 `20` |
| color | `ColorValue` | 当前主题文本色 | 设置自动生成文本、直接传入的 Tsuki / React Native Text 和可识别图标的前景色；自定义文本组件自行维护样式 |
| disabled | `boolean` | `false` | 禁止选择，使用 disabledColor 且不关闭 Popover |
| accessibilityLabel | `string` | 从文本推导 | action 的无障碍标签；自定义文本节点可显式提供 |

选择 action 的顺序是先调用 `onSelect(action, index)`，然后在 `closeOnAction` 为 `true` 时请求关闭。横向菜单使用独立的竖向 divider，纵向菜单使用横向 divider。横向列表由 action 与 divider 自然撑宽，不固定为 action 宽度之和。

### semantic styles

`styles.root` 和 `style` 作用于底层引擎的浮层内容根节点，由它统一承担背景、圆角和裁切，箭头颜色也从该背景派生；`style` 优先级更高。内部 container 与 list 默认透明，不覆盖 root 的视觉样式。`styles.container` 作用于内部内容容器，`styles.content` 作用于字符串或数字内容，`styles.mask` 作用于背景遮罩。`styles.reference` 是唯一用于 trigger wrapper 的语义槽位，普通 `style` 不会改变 children 的布局或点击边界。

`styles.itemContent` 作用于自动生成的 action Text 和直接传入的 Tsuki / React Native Text，优先级高于默认文本样式及 action 前景色。其他自定义文本组件保持原节点和自身样式，Popover 不根据组件名称猜测其文本语义。

| 插槽        | 实际节点与职责                                                               |
| ----------- | ---------------------------------------------------------------------------- |
| reference   | reference 测量边界；已有交互控件外层为 View，普通展示 reference 为 Pressable |
| root        | 底层引擎的浮层内容 View，控制背景、圆角和裁切                                |
| container   | Tsuki 内部内容 View，控制内容布局                                            |
| content     | 自定义 content 为字符串或数字时生成的 Text                                   |
| mask        | 底层引擎的背景 Animated.View                                                 |
| list        | action 列表 View，控制排列与列表布局                                         |
| item        | 单个 action 的 Pressable                                                     |
| itemIcon    | 装饰图标外层 View，控制图标槽位布局                                          |
| itemContent | 自动生成或直接传入的 Tsuki / React Native Text                               |
| divider     | action 之间的分隔 View                                                       |

动画定位、阴影承载和箭头节点属于底层引擎的实现，不作为公共样式插槽暴露。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.Popover` 覆盖 Popover token。Popover 的 `theme="light" | "dark"` 只选择 Popover 自身的视觉类型，颜色仍由当前 tsuki `AliasToken` 推导，因此外层 ConfigProvider 的 dark algorithm 和别的 token 覆盖仍然生效。

Popover token 包括：`borderRadius`、`actionWidth`、`actionHeight`、`actionFontSize`、`actionLineHeight`、`actionIconSize`、`actionIconGap`、`lightBackgroundColor`、`lightTextColor`、`lightDisabledColor`、`lightDividerColor`、`lightPressedBackgroundColor`、`darkBackgroundColor`、`darkTextColor`、`darkDisabledColor`、`darkDividerColor`、`darkPressedOverlayColor`、`arrowWidth`、`arrowHeight`、`offset`、`screenMargin`、`overlayColor`、`animationDuration` 和 `fontFamily`。light action 使用 surface pressed 背景，dark action 在原背景上显示专用 overlay。

### 无障碍

自动触发器保留 children 原有的无障碍语义，并补充当前展开状态；普通展示 reference 由 Pressable 提供 button 角色与激活操作，长按触发器也支持无障碍激活。icon-only reference 应由 children 或 Popover 提供 `accessibilityLabel`。每个 action 使用 `accessibilityRole="button"`，禁用 action 使用 `accessibilityState={{ disabled: true }}`。action 的图标槽作为装饰从无障碍树隐藏，不参与按钮标签；自定义 action 内容可通过 `PopoverAction.accessibilityLabel` 明确标签。组件不伪造 Web 专用的 `menu` / `menuitem` 角色。

### 平台限制

Popover 的定位、箭头、屏幕边界、设备旋转和键盘适配基于 `react-native-popover-view`。当前只支持 `auto`、`top`、`bottom`、`left`、`right` 和 `floating`，不包含 Vant Web 的 `top-start`、`top-end` 等 12 方位扩展。

`react-native-popover-view` 对 Web 没有官方保证，但本组件的 docs demo 通过 `react-native-web` 构建和运行路径验证；Web 使用时仍应在目标浏览器确认 reference 定位和 outside press。使用 Popover 的宿主需要提供 `react-native-safe-area-context` 的 `SafeAreaProvider`，组件会把 safe-area insets 与自身最小边缘 margin 一起传给定位层。

Popover 不提供 `showPopover()` imperative API，也不是 Tooltip、Dropdown 或 Popup 的替代实现。

## 动画

Popover 遵循 `Provider motion` 的开关、Reduced Motion 和 timing 时长倍率。定位和动画仍由 `react-native-popover-view` 的 RN Animated 引擎管理，尚未迁移到 Reanimated Primitive。
