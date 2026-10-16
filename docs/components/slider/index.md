---
title: Slider 滑块
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# Slider 滑块

<section className="component-doc-intro">

## 介绍

在指定范围内选择一个数值。支持拖动、点击定位、步长吸附、刻度和自定义滑块，可用于音量、亮度和字号档位选择。使用 RNGH 与 Reanimated，在 UI 线程更新拖动位置；没有额外的过渡动画。

</section>

<code src="../../../src/slider/__fixtures__/overview.tsx" title="组件预览" description="数值选择、步长刻度、状态和外观定制。"></code>

## 引入

```tsx | pure
import { Slider } from '@ftsukic/tsuki'
```

应用入口需要 `TsukiProvider` 默认提供的手势环境，或自行配置 `GestureHandlerRootView`。

## 代码演示

<code src="../../../src/slider/__fixtures__/examples/basic.tsx" title="基本用法" description="受控与非受控，实时变化与完成事件。"></code> <code src="../../../src/slider/__fixtures__/examples/steps.tsx" title="步长与刻度" description="离散档位、刻度标签和反向布局。"></code> <code src="../../../src/slider/__fixtures__/examples/states.tsx" title="禁用与只读" description="不可编辑的两种状态。"></code> <code src="../../../src/slider/__fixtures__/examples/theme.tsx" title="样式定制" description="组件 token、语义样式与滑块内容。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `number` | — | 受控值；父级负责回写 |
| defaultValue | `number` | `min` | 非受控初始值 |
| min / max | `number` | `0 / 100` | 数值范围 |
| step | `number` | `1` | 从 min 开始的正数步长，支持小数；max 始终可选 |
| disabled | `boolean` | `false` | 禁用交互并降低透明度 |
| readonly | `boolean` | `false` | 禁止交互，保留正常外观 |
| reverse | `boolean` | `false` | 将最小值放到右侧 |
| marks | `Record<number, ReactNode>` | — | 指定位置的刻度及标签；`null` 仅显示刻度 |
| included | `boolean` | `true` | 显示 min 到当前值的填充轨道 |
| onChange | `(value: number) => void` | — | 值变化时实时触发；相同值不重复触发 |
| onChangeComplete | `(value: number) => void` | — | 拖动、点击或无障碍调整成功完成，且最终值与操作前不同时触发；取消拖动不触发 |
| renderThumb | `(state: SliderStyleState) => ReactNode` | — | 自定义滑块内的内容，尺寸由 thumbSize token 决定 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `SliderStyles` | — | 对象或接收 `{ props, state }` 的函数 |

`state` 包含 `value`、`dragging`、`disabled`、`readonly`。受控模式在操作期间预览拖动位置，完成后以父级传入的 value 为准。`renderThumb` 内容使用 React 状态，随父级回写或非受控值更新。

超出范围的值会被限制；非有限值回退到 min。无效 min 回退到 0，无效 max 回退到不小于 min 的 100，max 小于 min 时按 min 处理；无效 step 回退到 1。范围相等时不可操作。步长相对 min 对齐，marks 只定义视觉刻度，不改变步长或吸附位置。标记超出范围会被忽略。不支持 `step={null}`、双滑块、垂直布局或内置 Tooltip。

继承 React Native `ViewProps`，但不接收 children，`style` 与 `onChange` 使用上表契约。组件管理 `accessible`、`accessibilityRole="adjustable"` 和增减动作，提供范围及当前值。可用 `accessibilityLabel` 命名，用 `accessibilityValue.text` 描述业务含义。未知无障碍动作转发到 `onAccessibilityAction`。只读和禁用均不响应增减。布局和返回手势冲突仍需宿主导航协调。

## 语义样式

| 插槽      | 作用                                                         |
| --------- | ------------------------------------------------------------ |
| root      | 根容器，默认包含半个滑块宽度的左右留白；style 优先           |
| body      | 高度默认 44 的触摸区域                                       |
| rail      | 完整背景轨道                                                 |
| track     | 填充轨道；宽度与反向定位由组件管理                           |
| thumb     | 滑块外观与内容容器；位置由组件管理                           |
| mark      | 刻度短线                                                     |
| markLabel | 字符串、数字标签的 Text 样式；ReactNode 标签自行管理内部样式 |

样式在默认值之后合并。修改轨道高度、颜色、圆角和滑块外观使用 styles；滑块的布局尺寸通过组件 token 的 thumbSize 设置。自定义内容区域不接管触摸事件。标签默认预留 24 高度，大型标签可通过 root 样式增加空间。

## 主题 Token

通过 `theme.components.Slider` 配置，`getSliderToken` 可读取默认映射。

| Token            | 默认值                    |
| ---------------- | ------------------------- |
| railColor        | `colorFillSecondary`      |
| trackColor       | `colorPrimary`            |
| thumbColor       | `colorBgContainer`        |
| thumbBorderColor | `colorBorder`             |
| railHeight       | `2`                       |
| thumbSize        | `24`                      |
| disabledOpacity  | Button 的 disabledOpacity |
