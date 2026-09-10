---
title: Skeleton 骨架屏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Skeleton 骨架屏

<section className="component-doc-intro">

## 介绍

Skeleton 用于内容加载期间展示稳定的标题、段落和头像占位。动画是同步呼吸式透明度变化，不提供 shimmer 扫光效果。

</section>

<code src="../../../src/skeleton/__fixtures__/overview.tsx" title="组件预览" description="Skeleton 的布局、加载状态、圆角、主题和动画示例。"></code>

## 引入

```tsx | pure
import { Skeleton } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/skeleton/__fixtures__/examples/basic.tsx" title="基础用法" description="展示标题和段落占位。"></code> <code src="../../../src/skeleton/__fixtures__/examples/avatar.tsx" title="头像" description="展示头像与内容区域的横向布局。"></code> <code src="../../../src/skeleton/__fixtures__/examples/widths.tsx" title="段落宽度" description="按行设置不同宽度。"></code> <code src="../../../src/skeleton/__fixtures__/examples/round.tsx" title="圆角和头像形状" description="分别控制段落圆角和头像形状。"></code> <code src="../../../src/skeleton/__fixtures__/examples/loading.tsx" title="加载状态" description="在骨架与 children 之间切换。"></code> <code src="../../../src/skeleton/__fixtures__/examples/theme.tsx" title="主题和动画" description="覆盖 token 并关闭全局 motion。"></code>

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
| styles | `SkeletonStyles` | — | root、placeholder、avatar、content、title、rows、row 语义样式 |

Skeleton 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。loading 状态默认使用 `accessibilityRole="progressbar"` 和 `accessibilityState.busy=true`，显式传入的 accessibility props 优先；非 loading 状态不强制 root 的无障碍语义。

### 主题定制

通过 `ConfigProvider theme.components.Skeleton` 覆盖 `backgroundColor`、尺寸、间距、圆角和动画 token。背景色默认派生自当前主题的 `colorFillSecondary`，因此会随明暗主题变化。`theme.token.motion=false` 会完全禁用动画。

Skeleton 不支持 shimmer、SVG、LinearGradient、DOM API，也不提供 `rowStyles(index)` 等额外公开 API。
