# Skeleton 骨架屏

## 介绍

Skeleton 用于内容加载期间展示稳定的标题、段落和头像占位。动画是同步呼吸式透明度变化，不提供 shimmer 扫光效果。

- [组件预览：Skeleton 的布局、加载状态、圆角、主题和动画示例。](../../../src/skeleton/__fixtures__/overview.tsx)

## 引入

```tsx
import { Skeleton } from '@ftsukic/tsuki'
```

## 代码演示

- [基础用法：展示标题和段落占位。](../../../src/skeleton/__fixtures__/examples/basic.tsx) - [头像：展示头像与内容区域的横向布局。](../../../src/skeleton/__fixtures__/examples/avatar.tsx) - [段落宽度：按行设置不同宽度。](../../../src/skeleton/__fixtures__/examples/widths.tsx) - [圆角和头像形状：分别控制段落圆角和头像形状。](../../../src/skeleton/__fixtures__/examples/round.tsx) - [加载状态：在骨架与 children 之间切换。](../../../src/skeleton/__fixtures__/examples/loading.tsx) - [主题和动画：覆盖 token 并关闭全局 motion。](../../../src/skeleton/__fixtures__/examples/theme.tsx)

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| loading | `boolean` | `true` | 为 `true` 显示骨架，为 `false` 保留 root 并展示 `children` |
| title | `boolean` | `false` | 是否显示标题占位 |
| avatar | `boolean` | `false` | 是否显示头像占位 |
| row | `number` | `0` | 段落行数；非有限值和负数按 `0` 处理，小数向下取整 |
| titleWidth | `DimensionValue` | `'40%'` | 标题宽度 |
| rowWidth | `DimensionValue | DimensionValue[]` | `'100%'` | 所有行宽度，或按 index 设置各行宽度；数组空位回退 token |
| avatarSize | `number` | `32` | 头像尺寸 |
| avatarShape | `'round' | 'square'` | `'round'` | 头像圆形或方形 |
| round | `boolean` | `false` | 仅控制标题和段落是否使用胶囊圆角 |
| animate | `boolean` | `true` | 是否启用呼吸动画 |
| style | `StyleProp<ViewStyle>` | — | root 样式，优先级高于默认样式和 `styles.root` |
| styles | `SkeletonStyles` | — | `root`、`header`、`avatar`、`section`、`title`、`paragraph`、`row` 语义样式；支持对象或函数。 |

Skeleton 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。loading 状态默认使用 `accessibilityRole="progressbar"` 和 `accessibilityState.busy=true`，显式传入的 accessibility props 优先；非 loading 状态不强制 root 的无障碍语义。

### 语义样式

| 槽位 | 对应节点与生效条件 |
| --- | --- |
| root | 始终保留的根容器；`style` 优先于 `styles.root` |
| header | 头像区域容器，仅在 loading 且 avatar 为 true 时存在；不包含标题 |
| avatar | header 内的头像占位块 |
| section | loading 时包含标题与段落的内容区域 |
| title | 标题占位块，仅在 loading 且 title 为 true 时存在 |
| paragraph | 段落行集合，仅在 loading 且归一化后的 row 大于 0 时存在；可用 marginTop 覆盖标题与段落的默认间距 |
| row | 每个段落占位块，共用同一份样式；可覆盖宽度和行间距 |

各槽位的自定义样式优先于默认样式和 token。内部动画层不公开样式槽位。loading 为 false 时仅保留 root 并直接渲染 children，其余槽位不生效。

标题、段落和头像都是装饰性占位，槽位名称不代表无障碍标题或文本语义。root 默认表达加载状态；可通过 accessibilityLabel 提供具体的加载说明。显式传入的 accessibilityState.busy（包括 false）优先于加载状态的默认值；加载完成后不再注入默认 role 和 busy，显式传入的无障碍属性仍保留。

### 主题定制

通过 `ConfigProvider theme.components.Skeleton` 覆盖 `backgroundColor`、尺寸、间距、圆角和动画 token。背景色默认派生自当前主题的 `colorFillSecondary`，因此会随明暗主题变化。`theme.seed.motion=false` 会完全禁用动画。

Skeleton 不支持 shimmer、SVG、LinearGradient、DOM API，也不提供 `rowStyles(index)` 等额外公开 API。

## 动画

占位内容共享内部 pulse preset，保留 `animate` 开关和默认 1200ms 的透明度呼吸周期。遵循全局关闭、Reduced Motion 与时长倍率；停止时恢复完整透明度。当前不提供 shimmer。
