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

<code src="../../../src/popover/__fixtures__/examples/semantic.tsx" title="语义样式" description="通过 semantic styles 定制 reference、content 和 action 插槽。"></code>

<code src="../../../src/popover/__fixtures__/examples/theme-token.tsx" title="主题 token" description="通过 ConfigProvider 覆盖 Popover component token。"></code>

## API

### Popover

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactElement` | — | reference / trigger；不会同时承担 popup content 语义 |
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
| styles | `PopoverStyles` | — | `reference`、`content`、`actions`、`action`、`actionIcon`、`actionText`、`divider` 语义样式 |
| onSelect | `(action, index) => void` | — | action 被选择后的回调；禁用 action 不触发 |
| onVisibleChange | `(visible) => void` | — | 所有内部打开/关闭请求的状态回调 |
| onOpen | `() => void` | — | 打开动画开始时触发 |
| onOpened | `() => void` | — | 打开动画完成时触发 |
| onClose | `() => void` | — | 关闭动画开始时触发 |
| onClosed | `() => void` | — | 关闭动画完成时触发 |

Popover 不整体继承 `react-native-popover-view` 的 Props，也不提供第三方的 `mode`、`popoverShift`、`arrowShift` 等实现细节。`children` 的原有 `accessibility`、样式和事件由 children 自己维护；Popover 只合并对应的 `onPress` 或 `onLongPress`，并保留原事件。普通 `View` reference 使用非可点击 wrapper 的 touch responder 作为 fallback。

`visible` 传入 `undefined` 之外的值时为受控模式。触发器、action 和 outside press 的请求都经过同一状态边界；受控模式只调用 `onVisibleChange`，不会在 Popover 内部篡改 `visible`。

### PopoverAction

| 属性     | 类型         | 默认值         | 说明                                          |
| -------- | ------------ | -------------- | --------------------------------------------- |
| text     | `ReactNode`  | —              | action 文本或自定义节点                       |
| icon     | `ReactNode`  | —              | action 左侧图标；默认图标槽位为 `20`          |
| color    | `ColorValue` | 当前主题文本色 | 只覆盖当前 action 的文本和可识别图标前景色    |
| disabled | `boolean`    | `false`        | 禁止选择，使用 disabledColor 且不关闭 Popover |

选择 action 的顺序是先调用 `onSelect(action, index)`，然后在 `closeOnAction` 为 `true` 时请求关闭。横向菜单使用独立的竖向 divider，纵向菜单使用横向 divider。

### semantic styles

`styles.content` 和 `style` 作用于 popup content 根节点；`style` 优先级更高。`styles.reference` 是唯一用于 trigger wrapper 的语义槽位，普通 `style` 不会改变 children 的布局或点击边界。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.Popover` 覆盖 Popover token。Popover 的 `theme="light" | "dark"` 只选择 Popover 自身的视觉类型，颜色仍由当前 tsuki `AliasToken` 推导，因此外层 ConfigProvider 的 dark algorithm 和别的 token 覆盖仍然生效。

Popover token 包括：`borderRadius`、`actionWidth`、`actionHeight`、`actionFontSize`、`actionLineHeight`、`actionIconSize`、`actionIconGap`、`lightBackgroundColor`、`lightTextColor`、`lightDisabledColor`、`lightDividerColor`、`lightPressedBackgroundColor`、`darkBackgroundColor`、`darkTextColor`、`darkDisabledColor`、`darkDividerColor`、`darkPressedOverlayColor`、`arrowWidth`、`arrowHeight`、`offset`、`screenMargin`、`overlayColor`、`animationDuration` 和 `fontFamily`。light action 使用 surface pressed 背景，dark action 在原背景上显示专用 overlay。

### 无障碍

触发器保留 children 原有的无障碍语义；icon-only 的 Button 应由调用方提供 `accessibilityLabel`。每个 action 使用 `accessibilityRole="button"`，禁用 action 使用 `accessibilityState={{ disabled: true }}`。组件不伪造 Web 专用的 `menu` / `menuitem` 角色。

### 平台限制

Popover 的定位、箭头、屏幕边界、设备旋转和键盘适配基于 `react-native-popover-view`。当前只支持 `auto`、`top`、`bottom`、`left`、`right` 和 `floating`，不包含 Vant Web 的 `top-start`、`top-end` 等 12 方位扩展。

`react-native-popover-view` 对 Web 没有官方保证，但本组件的 docs demo 通过 `react-native-web` 构建和运行路径验证；Web 使用时仍应在目标浏览器确认 reference 定位和 outside press。使用 Popover 的宿主需要提供 `react-native-safe-area-context` 的 `SafeAreaProvider`，组件会把 safe-area insets 与自身最小边缘 margin 一起传给定位层。

Popover 不提供 `showPopover()` imperative API，也不是 Tooltip、Dropdown 或 Popup 的替代实现。
