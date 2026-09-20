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

<code src="../../../src/badge/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Avatar, Badge } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/badge/__fixtures__/examples/types.tsx" title="数字、红点和独立展示" description="支持 content、显式 max、红点、零值和 standalone。"></code>

<code src="../../../src/badge/__fixtures__/examples/position.tsx" title="四角定位和偏移" description="包裹 children 时支持四个角的 position 和 offset。"></code>

<code src="../../../src/badge/__fixtures__/examples/status.tsx" title="状态点" description="使用兼容扩展 status 和 text 展示状态。"></code>

<code src="../../../src/badge/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="通过组件 token 和 styles 定制 Badge，包括 standalone 固定圆形。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 被角标包裹的内容；不传时支持独立展示 |
| content | `ReactNode` | — | 数字、字符串或自定义角标内容 |
| dot | `boolean` | `false` | 只展示红点，不展示 `content` |
| max | `number` | `undefined` | 仅当 `content` 是数字且大于显式传入的有效 `max` 时显示 `${max}+`；不会默认使用 99 |
| showZero | `boolean` | `true` | `content` 为 `0` 时是否展示 |
| color | `ColorValue` | 主题错误色 | 自定义数字角标或红点的背景色 |
| offset | `readonly [number, number]` | — | attached 模式下在 position 基础上的水平、垂直偏移 |
| position | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | attached 模式下的角落位置；standalone 模式不改变布局 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于 `styles.root` |
| styles | `BadgeStyles` | — | `root / indicator / dot / text` 语义样式 |

Badge 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。当 `dot` 和 `content` 都没有可展示内容时，如果存在 children 仍会渲染 children，否则不渲染节点。

### standalone

不传 `children` 时，Badge 按普通内容独立排列：

```tsx | pure
<Badge content={10} />
```

standalone 不使用 `absolute` 定位，`position` 不会制造额外位移；它可以直接和 Flex、Cell 或业务容器组合。包裹 children 时，Badge 才会使用 absolute 定位，并根据 indicator 的实际宽高在四个角居中。

数字为单字符时接近 16×16 圆形；两位及以上数字（包括 `99+`）按内容形成胶囊。`dot` 的默认尺寸为 8×8。

需要固定圆形时，通过 semantic styles 显式覆盖 indicator 和文字：

```tsx | pure
<Badge
  content={10}
  styles={{
    indicator: {
      width: 28,
      minWidth: 28,
      height: 28,
      minHeight: 28,
      paddingHorizontal: 0,
      borderRadius: 14,
    },
    text: {
      fontSize: 16,
      lineHeight: 28,
    },
  }}
/>
```

`styles.indicator` 控制角标本体，`styles.text` 控制内容文字；consumer semantic styles 会覆盖默认 token 样式。

## 兼容扩展

以下 API 保留用于兼容现有代码，不作为 Badge 的主 API 范式：

| 属性            | 替代 API  | 说明                                                          |
| --------------- | --------- | ------------------------------------------------------------- |
| `count`         | `content` | deprecated alias；同时传入时以 `content` 为准                 |
| `overflowCount` | `max`     | deprecated alias；同时传入时以 `max` 为准                     |
| `status`        | —         | Ant Design 风格状态扩展；设置后优先于 `content` 和 `dot`      |
| `text`          | —         | `status` 模式下显示在状态点右侧的文字                         |
| `size`          | —         | 保留 `small / medium` 尺寸兼容；未传时使用新的 Vant 16px 基线 |

`Badge` 不提供 Web slot、tooltip、动画或 `Badge.Ribbon` 等 RN 不存在的能力。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Badge` 配置尺寸、颜色、细边框和文字 token；其中 `textColor` 用于数字角标文字，`statusTextColor` 用于 status 模式文字，默认跟随主题普通文本色。`styles` 可进一步定制单个实例。

```tsx | pure
import { Avatar, Badge, ConfigProvider } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Badge: { color: '#7232DD' } } }}>
  <Badge content={8}>
    <Avatar>U</Avatar>
  </Badge>
</ConfigProvider>
```
