---
title: Badge 徽标
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Badge 徽标

<section className="component-doc-intro">

## 介绍

徽标用于在头像或其他内容附近展示数字、红点和状态信息。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Avatar, Badge } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/types.tsx" title="数字、红点和溢出" description="支持数字、红点、零值和 overflowCount。"></code>

<code src="./__fixtures__/examples/status.tsx" title="状态点" description="使用 status 和 text 展示状态。"></code>

<code src="./__fixtures__/examples/theme.tsx" title="主题和语义样式" description="通过组件 token 和 styles 定制 Badge。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 被角标包裹的内容；不传时支持独立展示 |
| count | `ReactNode` | — | 数字或自定义角标内容；数字超过 `overflowCount` 时显示封顶值 |
| dot | `boolean` | `false` | 只展示红点，不展示 count |
| showZero | `boolean` | `false` | `count` 为 `0` 时是否展示 |
| overflowCount | `number` | `99` | 数字封顶值 |
| status | `'success' \| 'processing' \| 'default' \| 'error' \| 'warning'` | — | 状态点颜色；设置后优先于 `count` 和 `dot` |
| text | `ReactNode` | — | status 模式下显示在状态点右侧的文字 |
| color | `ColorValue` | 主题错误色 | 自定义 count 或点的背景色 |
| size | `'small' \| 'medium'` | `'medium'` | 数字角标尺寸 |
| offset | `readonly [number, number]` | — | 相对默认右上角位置的水平、垂直偏移 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于 `styles.root` |
| styles | `BadgeStyles` | — | `root / indicator / dot / text` 语义样式 |

Badge 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。当 `status`、`dot`、`count` 都没有可展示内容时，如果存在 children 仍会渲染 children，否则不渲染节点。

角标包裹 children 时使用绝对定位在右上角；独立使用时按普通内容排列。`Badge` 不提供 Web tooltip、动画或 `Badge.Ribbon`。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Badge` 配置尺寸、颜色、边框和文字 token；`styles` 可进一步定制单个实例。

```tsx | pure
import { Avatar, Badge, ConfigProvider } from '@ftsukic/react-native-ui'

;<ConfigProvider theme={{ components: { Badge: { color: '#7232DD' } } }}>
  <Badge count={8}>
    <Avatar>U</Avatar>
  </Badge>
</ConfigProvider>
```
