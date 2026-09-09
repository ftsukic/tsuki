---
title: NoticeBar 通知栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# NoticeBar 通知栏

<section className="component-doc-intro">

## 介绍

NoticeBar 用于展示需要持续关注的消息通知，支持 Vant 风格的单行滚动、文本省略和多行换行。

</section>

<code src="../../../src/notice-bar/__fixtures__/overview.tsx" title="组件预览" description="展示 NoticeBar 的基础、组合内容、滚动、换行、交互、禁用和主题示例。"></code>

## 引入

```tsx | pure
import { NoticeBar } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/notice-bar/__fixtures__/examples/NoticeBar.tsx" title="基础通知" description="展示基础通知和左侧自定义图标。"></code>

<code src="../../../src/notice-bar/__fixtures__/examples/custom-content.tsx" title="组合内容" description="展示 children 自定义内容和静态右侧图标。"></code>

<code src="../../../src/notice-bar/__fixtures__/examples/scrollable.tsx" title="滚动配置" description="展示短内容循环滚动以及 speed、delay 配置。"></code>

<code src="../../../src/notice-bar/__fixtures__/examples/wrapable.tsx" title="换行" description="展示关闭滚动后的多行换行。"></code>

<code src="../../../src/notice-bar/__fixtures__/examples/interaction.tsx" title="交互" description="展示 onClick 计数和 onClose 隐藏当前通知。"></code>

<code src="../../../src/notice-bar/__fixtures__/examples/disabled.tsx" title="禁用" description="展示通知栏和关闭操作的禁用状态。"></code>

<code src="../../../src/notice-bar/__fixtures__/examples/theme.tsx" title="主题" description="展示通过 ConfigProvider 覆盖语义颜色和间距。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| text | `string` | `''` | 通知文本；未传 `children` 时使用 |
| children | `ReactNode` | — | 自定义通知内容，优先于 `text` |
| leftIcon | `ReactNode` | — | 左侧自定义图标或内容 |
| rightIcon | `ReactNode` | — | 右侧自定义图标；配合 `onClose` 时作为关闭操作 |
| visible | `boolean` | `true` | 是否显示通知栏 |
| disabled | `boolean` | `false` | 禁止点击和关闭操作，并应用禁用透明度 |
| scrollable | `boolean` | — | `true` 始终滚动；`false` 禁止滚动；未设置时只在内容溢出时滚动 |
| wrapable | `boolean` | `false` | 在不滚动时允许内容换行 |
| speed | `number` | `60` | 滚动速度，单位为 px/s；无效或非正数回退到默认值 |
| delay | `number` | `1` | 开始滚动前的延迟，单位为秒；负数按 0 处理 |
| onClick | `() => void` | — | 点击通知栏时触发 |
| onClose | `() => void` | — | 点击关闭操作后触发；会同时隐藏当前实例 |

NoticeBar 使用 `alert` 无障碍语义和 `polite` live region。关闭操作使用 `button` 语义并提供“关闭通知”标签；disabled 状态会写入 `accessibilityState.disabled`。

组件只接受上表中的公开 Props，不转发原生 `ViewProps` 或 `PressableProps`，也不提供 `style`/`styles` 插槽。布局应由外层容器控制，颜色、字号、间距和动画总开关来自当前 `ConfigProvider` 的 Alias Token：默认使用 `colorWarningBg`、`colorWarning`、`padding`、`fontSize`、`lineHeightXL` 和 `motion`。

`children` 为自定义 React 节点时，组件负责布局和滚动容器，节点自身负责文本样式与换行。`scrollable={false}` 的 primitive 文本使用尾部省略；`wrapable` 仅在不滚动时生效。

React Native 版本不提供 Vant Web 的 `mode`、`color`、`background`、字符串图标名、`replay` 事件或 `reset` 方法，也不使用 CSS、DOM 和 HTML 字符串。
