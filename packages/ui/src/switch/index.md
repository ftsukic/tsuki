---
title: Switch 开关
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Switch 开关

<section className="component-doc-intro">

## 介绍

用于在打开和关闭状态之间进行切换，视觉结构和状态行为参考 Vant Switch。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Switch } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="支持受控 checked 和非受控 defaultChecked 两种写法。"></code>

<code src="./__fixtures__/examples/size-color.tsx" title="尺寸和颜色" description="size 控制尺寸，activeColor 和 inactiveColor 控制开关状态颜色。"></code>

<code src="./__fixtures__/examples/states.tsx" title="禁用与加载" description="disabled 禁止交互，loading 显示加载指示器并禁止切换。"></code>

<code src="./__fixtures__/examples/custom.tsx" title="自定义内容" description="使用 node 和 background 自定义滑块及轨道内容，也可以映射业务值。"></code>

<code src="./__fixtures__/examples/cell.tsx" title="搭配 Cell" description="将 Switch 放入 Cell 的 value 区域实现设置项开关。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 Switch token 统一定制尺寸、颜色、阴影和动画。"></code>

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | - | 受控开关状态 |
| `defaultChecked` | `boolean` | `false` | 非受控初始状态 |
| `loading` | `boolean` | `false` | 是否显示加载状态；加载时不可点击 |
| `disabled` | `boolean` | `false` | 是否禁用；禁用时不可点击并降低透明度 |
| `size` | `number` | `26` | 轨道和滑块尺寸，单位为 RN logical pixel |
| `activeColor` | `ColorValue` | 主题值 | 开启状态的轨道颜色 |
| `inactiveColor` | `ColorValue` | 主题值 | 关闭状态的轨道颜色 |
| `activeValue` | `SwitchValue` | `true` | 开启状态对应的业务值 |
| `inactiveValue` | `SwitchValue` | `false` | 关闭状态对应的业务值 |
| `node` | `ReactNode` | - | 滑块内部的自定义内容 |
| `background` | `ReactNode` | - | 轨道内部的自定义内容 |
| `onChange` | `(checked, value) => void` | - | 切换成功后触发，返回新的 checked 状态和映射值 |
| `onPress` | `PressableProps['onPress']` | - | React Native 按压事件 |
| `style` | `StyleProp<ViewStyle>` | - | root 样式 |
| `styles` | `SwitchStyles` | - | root、node、background、loading 语义样式 |

组件继承 React Native `PressableProps`，但 `children`、`style` 和 `disabled` 由 Switch 自己定义。`disabled` 或 `loading` 时会同时禁止 Pressable 交互；受控模式下，`onChange` 只通知调用方，状态需要由调用方更新 `checked`。

`activeValue` 和 `inactiveValue` 只用于 `onChange` 的第二个回调参数，开关状态仍由 `checked` / `defaultChecked` 管理。`SwitchValue` 为 `string | number | boolean`。

### 无障碍

默认 `accessibilityRole` 为 `switch`，并暴露 `accessibilityState.checked`、`disabled` 和 `busy`。可以通过 `accessibilityLabel` 等继承的 `PressableProps` 补充业务语义。

### 动画与样式

开关默认使用主题动画进行轨道颜色和滑块位移过渡；`theme.token.motion=false` 时立即切换。Vant 风格的默认几何关系为：轨道宽度约为 `1.8 * size + 4`，轨道高度为 `size + 4`，滑块从距离轨道左侧 `2` 的位置开始。

`styles` 可以是对象或函数，函数接收 `{ props, state }`，其中 `state` 包括 `checked`、`disabled`、`loading` 和 `pressed`。

```tsx | pure
<Switch
  styles={({ state }) => ({
    root: { marginTop: state.checked ? 4 : 0 },
    node: { borderWidth: state.pressed ? 2 : 0 },
  })}
/>
```

### 主题定制

通过 `ThemeProvider` 的 `theme.components.Switch` 覆盖以下 token：`size`、`activeColor`、`inactiveColor`、`nodeBackground`、`nodeShadowColor`、`nodeShadowOffset`、`nodeShadowOpacity`、`nodeShadowRadius`、`duration` 和 `disabledOpacity`。

本组件不提供 Vant 的 `modelValue`、`v-model`、`click` 或 `beforeChange` API；React Native 项目分别使用 `checked`、`onPress`/`onChange` 和调用方自己的异步状态控制。
