# Swipe 轮播

## 介绍

Swipe 用于横向或纵向切换内容，支持 Vant Swipe 的循环、自动播放、指示器和命令式导航能力。

- [组件预览：Swipe 的基础、自动播放、循环、纵向、自定义指示器和命令式示例。](../../../src/swipe/__fixtures__/overview.tsx)

## 引入

```tsx
import { Swipe } from '@ftsukic/tsuki'
```

## 代码演示

- [基础用法：横向滑动三个页面。](../../../src/swipe/__fixtures__/examples/basic.tsx) - [自动播放：每三秒切换一次。](../../../src/swipe/__fixtures__/examples/autoplay.tsx) - [循环播放：首尾连续切换。](../../../src/swipe/__fixtures__/examples/loop.tsx) - [纵向滚动：固定高度的纵向轮播。](../../../src/swipe/__fixtures__/examples/vertical.tsx) - [自定义 indicator：使用 renderIndicator 显示页码。](../../../src/swipe/__fixtures__/examples/custom-indicator.tsx) - [imperative ref：使用 prev、next 和 swipeTo 导航。](../../../src/swipe/__fixtures__/examples/imperative.tsx)

## API

### SwipeProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | `Swipe.Item` 子项；逻辑页码只计算有效子项 |
| autoplay | `number` | `0` | 自动切换间隔，单位为毫秒；小于等于 0 时关闭 |
| duration | `number` | `500` | 切页动画时长；主题 `motion=false` 时为 0 |
| initialSwipe | `number` | `0` | 初始逻辑页码，自动归一化或限制在合法范围 |
| loop | `boolean` | `true` | 是否循环切换 |
| showIndicators | `boolean` | `true` | 是否显示默认指示器 |
| vertical | `boolean` | `false` | 是否纵向切换 |
| touchable | `boolean` | `true` | 是否启用手势；关闭后 imperative 和 autoplay 仍可用 |
| width / height | `number` | — | 指定每个 SwipeItem 的尺寸 |
| indicatorColor | `string` | token | 覆盖激活指示器背景色；非激活点仍使用主题 token |
| renderIndicator | `(info) => ReactNode` | — | 自定义指示器；`info.total` 不包含 loop clone |
| onChange | `(index) => void` | — | 逻辑页码改变后调用一次 |
| style | `StyleProp<ViewStyle>` | — | 根节点样式 |
| styles | `SwipeStyles` | — | `root`、`track`、`item`、`indicators`、`indicator`、`activeIndicator` 语义样式；支持对象或函数。 |

Swipe 继承其他 React Native `ViewProps`。不提供 Web CSS、`teleport`、DOM ref 或 `className` API。

### SwipeItemProps

`SwipeItem` 继承 React Native `ViewProps`，只负责承载一个页面内容，不增加额外状态管理 API。也可以使用 `Swipe.Item`。

### SwipeRef

```ts
interface SwipeRef {
  prev(): void
  next(): void
  swipeTo(index: number, options?: { immediate?: boolean }): void
}
```

`immediate=true` 会直接定位且仍按最终逻辑页码触发 `onChange`。

### styles 与主题

`styles` 支持 `root`、`track`、`item`、`indicators`、`indicator` 和 `activeIndicator`。函数形式会收到 `activeIndex`、`total`、`vertical` 和 `dragging`。

节点结构为根视口 `root` → 页面集合 `track` → 页面 `item`，默认指示器位于根视口内。`styles.item` 应用到每个页面；页面样式依次合并默认样式、`styles.item` 和 `Swipe.Item.style`，内部尺寸与位移动画约束最后应用。`Swipe.Item` 的原生 View props 与 ref 落到同一个页面节点。

非当前页面会从无障碍树中隐藏，切页后恢复目标页面自身的无障碍设置；显式设置的 `accessibilityElementsHidden` 和 `importantForAccessibility` 在页面激活时仍然保留。

通过 `ConfigProvider` 的 `theme.components.Swipe` 覆盖 `indicatorSize`、`indicatorMargin`、`indicatorGap`、`indicatorInactiveOpacity`、`indicatorActiveOpacity`、`indicatorBackground`、`indicatorActiveBackground` 和 `animationDuration`。默认动画时长为 Vant 的 500ms，不跟随 `motionDurationSlow`。

Vant 的 `indicator` slot 在 React Native 中对应 `renderIndicator({ activeIndex, total })`；不会映射 Web 专属 CSS slot 或 DOM API。
