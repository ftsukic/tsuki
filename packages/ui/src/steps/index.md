---
title: Steps 步骤条
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Steps 步骤条

<section className="component-doc-intro">

## 介绍

Steps 用于展示线性流程的完成状态，按 `current` 标记已完成步骤，`data` 提供步骤标题、图标和显式状态。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础步骤条" description="使用 current 和 data 展示流程进度。"></code>

## 引入

```tsx | pure
import { Steps } from '@ftsukic/react-native-ui'
```

## API

| 属性      | 说明             | 类型                   | 默认值 |
| --------- | ---------------- | ---------------------- | ------ |
| `current` | 当前步骤索引     | `number`               | 必填   |
| `data`    | 步骤数据         | `StepsItemProps[]`     | —      |
| `theme`   | 覆盖 Steps token | `Partial<StepsToken>`  | —      |
| `style`   | 内容容器样式     | `StyleProp<ViewStyle>` | —      |

当 `data` 为空时 Steps 不渲染。步骤项的 `status` 可显式设为 `wait` 或 `finish`，未设置时按 `current >= index` 推导。组件当前按三项的屏幕宽度布局，更多步骤会在横向滚动容器中展示；它不是可交互的导航控件，需由外层处理点击。接口中的 `children` 为兼容字段，当前实现不会渲染它。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
