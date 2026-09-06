---
title: Icon 图标
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Icon 图标

<section className="component-doc-intro">

## 介绍

`Icon` 使用 `@ant-design/icons-svg` 图标定义，并通过 `react-native-svg` 渲染到 React Native。传入 `onPress` 或 `touchableSize` 时会提供适合触摸的 Pressable 容器。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Icon } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="使用内置图标名称、颜色、尺寸和点击事件展示图标。"></code>

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `name` | 内置图标名称 | `IconName` | 必填 |
| `size` | 图标宽高 | `number` | `24` |
| `color` | 图标颜色 | `ColorValue` | 主题文字色 |
| `rotation` | 顺时针旋转角度 | `number` | `0` |
| `disabled` | 禁止点击反馈和点击事件 | `boolean` | `false` |
| `touchableSize` | Pressable 触摸区域尺寸 | `number` | `44` |
| `twoToneColor` | 双颜色图标的颜色配置 | `string \| readonly [string, string]` | — |
| `style` | 外层 Pressable 或 View 样式 | `StyleProp<ViewStyle>` | — |
| `svgStyle` | 内层 SVG 样式 | `SvgProps['style']` | — |
| `onPress` | 点击回调 | `PressableProps['onPress']` | — |

`name` 也可以使用导出的 `IconDefinition`，通过 `AntdNativeIcon` 直接渲染自定义定义。仅展示图标时可以省略 `onPress`；作为操作入口时请提供 `accessibilityLabel`，不要只依赖图形传达操作含义。组件继承其余兼容的 `react-native-svg` Props。

组件不提供 Web 专用的 `className`、CSS `fill` 字符串或 HTML 图标节点；使用 `color`、`size`、`style` 和 `svgStyle` 定制外观。
