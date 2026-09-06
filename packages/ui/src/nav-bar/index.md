---
title: NavBar 导航栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# NavBar 导航栏

<section className="component-doc-intro">

## 介绍

NavBar 用于展示页面标题及左右操作入口，支持固定或自适应标题布局、图标替换、附加节点和顶部下分隔线。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础导航栏" description="使用 title 和默认左右区域展示页面导航栏。"></code>

## 引入

```tsx | pure
import { NavBar } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `title` / `titleExtra` | 标题或自定义标题节点 | `ReactNode` | — |
| `layout` | 标题布局，`center` 绝对居中，`flex` 按空间布局 | `'center' \| 'flex'` | `'center'` |
| `showLeftIcon` / `showRightIcon` | 是否展示左右图标 | `boolean` | `true` / `false` |
| `leftIcon` / `rightIcon` | 图标名称 | `IconName` | 左 `LeftOutlined` / 右 `PlusOutlined` |
| `leftExtra` / `rightExtra` | 图标旁附加节点 | `ReactNode` | — |
| `onPressLeftIcon` / `onPressRightIcon` | 图标点击回调 | `() => void \| Promise<void>` | — |
| `divider` | 是否显示底部分隔线 | `boolean` | `true` |
| `titleTextStyle` | 标题文本样式 | `StyleProp<TextStyle>` | — |
| `style` | 根容器样式 | `StyleProp<ViewStyle>` | — |
| `theme` | 覆盖 NavBar token | `Partial<NavBarToken>` | — |

NavBar 只继承 `ViewProps` 的 `testID`。提供点击回调时图标使用 Pressable，并保留 React Native 无障碍属性；自定义 `leftExtra` 和 `rightExtra` 需要自行提供交互语义。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
