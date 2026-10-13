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

<code src="../../../src/badge/__fixtures__/examples/status.tsx" title="状态点" description="使用 status 和 text 展示状态。"></code>

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
| styles | `BadgeStyles` | — | `root / indicator / content / text` 语义样式 |

Badge 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。当 `dot` 和 `content` 都没有可展示内容时，如果存在 children 仍会渲染 children，否则不渲染节点。

### standalone

不传 `children` 时，Badge 按普通内容独立排列：

```tsx | pure
<Badge content={10} />
```

standalone 不使用 `absolute` 定位，`position` 不会制造额外位移；它可以直接和 Flex、Cell 或业务容器组合。包裹 children 时，Badge 才会使用 absolute 定位，并根据 indicator 的实际宽高在四个角居中。

数字为单字符时接近 16×16 圆形；两位及以上数字（包括 `99+`）按内容形成胶囊。`dot` 的默认尺寸为 8×8。

需要固定圆形时，通过 semantic styles 显式覆盖 indicator 和 content：

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
    content: {
      fontSize: 16,
      lineHeight: 28,
    },
  }}
/>
```

`styles.indicator` 控制角标本体，`styles.content` 控制自动生成的数字或内容文字；consumer semantic styles 会覆盖默认 token 样式。

## 语义结构与无障碍

| 槽位      | 作用                                                |
| --------- | --------------------------------------------------- |
| root      | 整体根 View；style、ref 和继承的 ViewProps 指向这里 |
| indicator | 数字徽标本体、普通红点或状态点                      |
| content   | content 中自动生成的 Text                           |
| text      | status 模式下 text 中自动生成的说明 Text            |

状态点和说明文字的排列、附着模式的定位与测量层属于内部结构，不提供样式槽。自定义 ReactNode 内部样式由调用方设置；数组和 Fragment 中的裸文字会自动生成 Text。空字符串、布尔值和空数组或 Fragment 不会生成内容徽标；数字 0 由 showZero 控制。

standalone 的数字文字、红点和状态点默认提供可访问标签，分别为显示内容、`提示` 和状态名称；有纯文字状态说明时优先使用说明。自定义节点不推断内部内容，请显式设置 accessibilityLabel。业务应使用有含义的标签，例如 `accessibilityLabel="有未读消息"`。显式 accessible 和 accessibilityLabel 优先。

attached 模式不会自动将 children 分组或改写其无障碍标签，交互控件保留自身语义。业务应在目标控件的 label 中包含角标信息。动态播报可使用继承的 accessibilityLiveRegion；组件不默认播报每次计数更新。

## 状态与尺寸

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| status | `'success' \| 'processing' \| 'default' \| 'error' \| 'warning'` | — | 状态点；优先于 content 和 dot |
| text | `ReactNode` | — | 状态点右侧说明 |
| size | `'small' \| 'medium'` | — | 默认使用 16px 基线；medium 使用 20px |

## 迁移

删除 count 和 overflowCount，分别使用 content 和 max。删除 styles.dot，状态点统一使用 styles.indicator；status 模式的 styles.indicator 不再作用于整行容器。数字文字从 styles.text 迁移到 styles.content；styles.text 仅控制状态说明。没有旧字段兼容解析。

`Badge` 不提供 Web slot、tooltip、动画或 `Badge.Ribbon`。

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
