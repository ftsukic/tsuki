---
title: Motion 动画
componentDoc: true
toc: false
nav:
  title: 基础能力
group:
  title: 基础组件
  order: 1
---

# Motion 动画

<section className="component-doc-intro">

## 介绍

Motion 提供可复用的 Reanimated transition preset。`useTransitionProgress` 暴露同一个 shared progress，适合让多个视觉层保持同步；`useAnimatedTransition` 保持只返回 animated style 的兼容用法。

</section>

<code src="../../../src/motion/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import {
  Animated,
  motionPresets,
  useAnimatedTransition,
  useTransitionProgress,
} from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/motion/__fixtures__/examples/MotionExample.tsx" title="兼容用法" description="使用 useAnimatedTransition 获取单个 animated style。"></code>

<code src="../../../src/motion/__fixtures__/examples/PresetsExample.tsx" title="预设动画" description="使用 dialog 和 drawer preset。"></code>

<code src="../../../src/motion/__fixtures__/examples/progress.tsx" title="共享 progress" description="使用同一个 shared progress 同时驱动面板和辅助状态层。"></code>

## API

### useTransitionProgress

```tsx | pure
const { progress, animatedStyle } = useTransitionProgress(options)
```

`options` 与 `useAnimatedTransition` 相同：`visible` 必填；可选 `type`、`preset`、`distance`、`scale`、`opacity`、`entering`、`leaving` 和 `onTransitionEnd`。`progress` 是 `SharedValue<number>`，范围为 `0` 到 `1`；`animatedStyle` 是由该 progress 计算出的 animated style。打开从 `0` 开始，关闭到 `0` 结束，新的 `visible` 状态会取消旧动画并过滤旧完成回调。

### useAnimatedTransition

```tsx | pure
const animatedStyle = useAnimatedTransition(options)
```

返回值保持为 animated style，适合只需要一个 transition 样式的现有调用点。Popup 使用 `useTransitionProgress` 让面板和遮罩共享 progress。

### MotionPreset

内置 `motionPresets` 包括 `fade`、`dialog`、`popupBottom`、`popupTop`、`drawerLeft` 和 `drawerRight`。`entering` 与 `leaving` 支持 `timing`、`spring`、时长、缓动和 Reanimated 动画配置。
