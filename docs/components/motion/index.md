# Motion 动画

## 介绍

Motion 统一动画策略、Token、Preset 和 Primitive。组件用法使用 `Transition`、`MotionView` 和 `MotionPressable`；需要自行管理容器时使用 `useTransitionProgress` 与 `useAnimatedTransition`。

- [组件预览](../../../src/motion/__fixtures__/overview.tsx)

## 引入

```tsx
import { TsukiProvider, Transition, MotionView, MotionPressable } from '@ftsukic/tsuki'
```

## 代码演示

- [退出与卸载：只观察卡片的生命周期与卸载空态。](../../../src/motion/__fixtures__/examples/transition-lifecycle.tsx)

- [属性动画：在固定展示区域内改变属性，始终保持挂载。](../../../src/motion/__fixtures__/examples/property-animation.tsx)

- [基础过渡效果：十一种效果独立展示隐藏状态。](../../../src/motion/__fixtures__/examples/transition-effects.tsx)

- [动效策略：全局、局部开关与减少动态效果。](../../../src/motion/__fixtures__/examples/motion-config.tsx)

- [语义预设：比较浮层与强调场景的 preset。](../../../src/motion/__fixtures__/examples/semantic-presets.tsx)

- [快速反转：动画途中反向切换与最终完成事件。](../../../src/motion/__fixtures__/examples/interruption.tsx)

- [反馈动效：旋转、呼吸和错误反馈。](../../../src/motion/__fixtures__/examples/feedback.tsx)

- [组件动效：Popup 退出与 Collapse 动态内容。](../../../src/motion/__fixtures__/examples/component-motion.tsx)

- [过渡 Hook：自行承载 animated style 的用法。](../../../src/motion/__fixtures__/examples/transition-hooks.tsx)

- [共享进度：同一个 progress 驱动多个样式。](../../../src/motion/__fixtures__/examples/shared-progress.tsx)

## API

### 动画原则与设计值

优先使用 opacity / transform。进入和退出可以使用不同的时长；按压反馈短而轻，手势释放使用 spring，Loading 使用 linear。业务组件复用语义 preset，复杂属性动画通过 MotionView 实现。

基础视觉效果定义在 `effects.ts`，组件场景和公开 preset 定义在 `presets.ts`，公开 `motionPresets` 与组件引用相同的语义配置。所有设计值来自 Token，缓动曲线由 `easing.ts` 统一管理。

不维护旧版本别名、参数分支或兼容导出；`dialogSoft` 已合并到 `dialog`，默认常量和 `getTransitionStyle` 为内部实现。内部设计值不作为公共配置对象导出；常规组件继续通过已有 duration 或 component token 覆盖时长。

| 类别 | 内部默认值与用途 |
| --- | --- |
| Duration | instant 0、fastest 100、fast 140、normal 200、base 240、slow 300、slower 400ms；已有组件保留其 token 默认值 |
| Distance | 2 / 4 / 8 / 16 / 24 / 32 / 48；fade 方向轻移使用 8，slide 按自身尺寸 |
| Scale | pressed 0.96、subtlePressed 0.985、iconPressed 0.92、enter 0.96、subtleEnter 0.98；Pressable 与 MotionPressable 默认按压缩放均为 0.96 |
| Spring | soft 用于柔和移动，normal 用于状态变化，responsive 用于手势吸附，bouncy 用于强调反馈 |
| Easing | standard 用于状态，enter / exit 用于进入和退出，linear 用于旋转；既有浮层曲线保留 |

Collapse 的 height 和指示器背景的 width 属于布局语义例外。不要用 left / top / margin 驱动连续拖动；不要将 Portal 的挂载直接绑定 visible；退出完成后再卸载。普通列表 Cell 使用背景或透明度反馈，避免默认缩放整行。

浮层的遮罩与面板样式分别管理，并保留共享进度的同步行为。手势 resolver 负责 distance / velocity 决策与 overshoot 衰减，spring 负责吸附；SwipeCell 默认保留无 overshoot 的边界。

### MotionConfig

在现有 TsukiProvider 上使用 `motion`，或通过 `ConfigProvider theme={{ motion: ... }}` 配置。两者使用同一个 ThemeContext；TsukiProvider 的 `motion` 覆盖同层 `theme.motion`。

```tsx
<TsukiProvider motion={{ enabled: true, reducedMotion: 'system', durationScale: 1 }}>
  {children}
</TsukiProvider>
```

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| enabled | `boolean` | `true` | 关闭动画，保留状态、完成事件和即时按压反馈 |
| reducedMotion | `'system' \| 'always' \| 'never'` | `'system'` | 系统减少动态效果通过一条共享订阅实时更新；当前降级为即时完成 |
| durationScale | `number` | `1` | timing 和循环时长倍率；`0` 关闭所有 Motion；物理 spring 不按倍率改变参数 |

嵌套 ConfigProvider 按字段继承配置，`inherit: false` 恢复默认配置。`theme.seed.motion=false` 仍是硬开关，局部 `motion=true` 或 `ReduceMotion.Never` 不能绕过它。Primitive 不暴露 Reanimated 类型，Hook 返回 SharedValue 和 animated style。

### Transition

继承 `ViewProps` 并转发 View ref。`style` 是动画根节点的布局与基础样式，Motion 的 opacity / transform 在它之后应用；不提供 semantic `styles`。按 `hidden → entering → entered → exiting → hidden` 管理生命周期；退出立即禁用点击并隐藏 accessibility，动画完成才触发 `onExited` 和按需卸载。保持挂载时，children 自身 state 在开关之间保留。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | 必填 | 目标可见状态 |
| name | `TransitionName` | `'fade'` | `fade`、`scale`、`scale-fade`、`slide-up/down/left/right`、`fade-up/down/left/right` |
| duration | `number` | 主题 `motionDurationMid` | 进入与退出时长，毫秒 |
| enterDuration / exitDuration | `number` | duration | 独立覆盖方向时长 |
| delay | `number` | `0` | 开始前的延迟，毫秒；即时模式忽略延迟 |
| appear | `boolean` | `true` | 是否执行首次进入；false 不影响后续切换 |
| unmountOnExit | `boolean` | `false` | 完成退出后卸载 children |
| motion | `boolean` | `true` | 局部关闭动画 |
| onEnter / onEntered / onExit / onExited | `() => void` | — | 开始 / 完成事件；中断的目标不触发完成 |

slide 使用测量到的自身宽高；测量前使用视口作为初始移出距离。fade 方向使用 8px 轻移，scale-fade 使用 0.96 缩放。自身 opacity / transform 动画通过 Motion 参数控制，children 可以保留独立 transform。

### MotionView

继承 `ViewProps` 并转发 ref；始终保持挂载。`animate` 与 `initial` 支持 `opacity`、`translateX`、`translateY`、`scale`、`rotate`，rotate 单位为度。initial 只定义首次端点，未指定时从 animate 当前值开始。目标变更从当前位置继续。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| animate | `MotionValues` | 必填 | 目标属性 |
| initial | `MotionValues` | animate | 首次属性 |
| duration | `number` | 主题 `motionDurationMid` | timing 时长 |
| spring | `SpringPreset` | 未指定 | `soft`、`normal`、`responsive`、`bouncy`；指定后使用物理 spring |
| motion | `boolean` | `true` | 局部关闭 |

`style` 指向根节点；指定的动画属性覆盖同名静态 style，不提供 `styles`。没有 timeline、keyframe、SVG morph 或 layout DSL。

### MotionPressable

复用现有 Pressable，继承其 props、ref、children/style function、交互去抖和 accessibility。`feedback` 为 `'scale' | 'opacity' | 'none'`，默认 `'scale'`；`pressedScale` 默认 0.96，`pressedOpacity` 使用主题。`motion=false` 关闭插值但保留即时按压反馈。Cell 继续使用 background / opacity，默认不缩放。

### 内部组件接入

Token、语义 Preset、数值驱动、测量和手势 resolver 均为 internal。Popup / Dialog / ActionSheet / Overlay / Notify 复用浮层能力；Toast、Switch、Checkbox、Radio、Collapse、Loading、Skeleton、SwipeCell、Dropdown、Tabs、Segmented 已接入 Motion。Button 通过现有 Pressable 接入策略；不改变默认的背景或遮罩反馈。

`Collapse` 保留现有折叠组 API，不另设同名的 visible Primitive。Popover 接入策略但仍由外部库管理定位及 RN Animated；Progress、FloatingPanel 等复杂旧驱动留待后续迁移。未迁移组件通过 useToken 获得统一关闭和 Reduced Motion 状态；其既有时长暂不应用 durationScale。

### Motion Hook

### useTransitionProgress

```tsx
const { progress, animatedStyle } = useTransitionProgress(options)
```

`options` 与 `useAnimatedTransition` 相同。返回的 `progress` 是 `SharedValue<number>`，始终限制在 `0～1`，`0` 表示隐藏端点，`1` 表示显示端点。`animatedStyle` 负责当前过渡的透明度和 transform。

首次进入在动效开启时从隐藏端点开始；动效关闭时首次渲染直接处于目标端点。动画途中改变 `visible`，会取消旧动画，从当前位置朝新目标继续；被取消的动画不会触发完成事件。更改配置不会重新播放已显示内容的入场动画。

### useAnimatedTransition

```tsx
const animatedStyle = useAnimatedTransition(options)
```

返回 animated style，适合只需要一个过渡样式的调用点。使用 `Animated.View` 等 Reanimated 节点承载它；`style` 仍由 React Native 节点决定，Motion 不添加容器或语义样式 slot。

### UseAnimatedTransitionOptions

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | 必填 | 控制过渡目标；不控制节点是否挂载 |
| type | `MotionTransitionType` | preset 的 type，或 `'fade'` | `fade`、`scale`、`slide-up`、`slide-down`、`slide-left`、`slide-right` |
| preset | `MotionPreset` | — | 可复用的效果与进出场配置 |
| distance | `number` | preset 的 distance，或 `32` | 平移的隐藏端点距离，单位与 React Native 布局一致 |
| scale | `number` | preset 的 scale，或 `0.96` | 缩放的隐藏端点；限制在 `0～1` |
| opacity | `number` | 未指定 | 显式透明度端点，限制在 `0～1`；淡入淡出未指定端点时使用 `1` |
| fade | `boolean` | preset 的 fade，或 `false` | 为 scale 或 slide 同时添加淡入淡出 |
| overshoot | `boolean` | preset 的 overshoot，或 `false` | 允许 transform 使用超出 `0～1` 的 spring 进度；透明度与返回的 progress 仍限制范围 |
| motion | `boolean` | `true` | `false` 时直接到达目标；主题 `motion=false` 时局部 `true` 也不会启动动画 |
| entering | `MotionAnimationConfig` | preset 的 entering | 按字段覆盖进入配置 |
| leaving | `MotionAnimationConfig` | preset 的 leaving | 按字段覆盖退出配置 |
| onTransitionEnd | `(visible: boolean) => void` | — | 当前目标完成后触发；被中断的旧动画不会触发 |
| appear | `boolean` | `true` | 是否播放首次进入 |
| delay | `number` | `0` | 当前目标开始前的延迟，毫秒 |

显式的 `type`、`distance`、`scale`、`fade` 与 `overshoot` 优先于 preset。`entering`、`leaving` 按字段合并，例如仅传 `entering={{ duration: 600 }}` 会保留 preset 的其他进入配置。

`scale` 和 slide 在 `fade=false` 时只改变 transform，显式 `opacity` 保持恒定；需要淡入淡出时设置 `fade=true`。`type='fade'` 始终使用透明度过渡。

### MotionAnimationConfig

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | `'timing' \| 'spring'` | `'timing'` | 使用定时动画或物理弹簧 |
| duration | `number` | 主题 `motionDurationMid`，无主题时 `200` | timing 时长，单位毫秒；`0` 即时到达目标 |
| easing | `WithTimingConfig['easing']` | 等价于 `Easing.inOut(Easing.quad)` | timing 的缓动曲线 |
| damping | `number` | `20` | spring 阻尼 |
| stiffness | `number` | `240` | spring 刚度 |
| mass | `number` | `1` | spring 质量 |
| reduceMotion | `ReduceMotion` | `ReduceMotion.System` | 遵循系统减少动态效果，或显式使用 Always / Never |

`duration` 不控制物理 spring 的周期；spring 由 `damping`、`stiffness`、`mass` 决定。关闭主题或局部动效时，timing 和 spring 都直接到达目标，当前完成事件仍正常触发。

### MotionPreset

`MotionPreset` 包含 `type`、`distance`、`scale`、`fade`、`overshoot`、`entering` 和 `leaving`。可直接使用内置 preset，也可以传入自定义配置。

| preset | 效果 | 配置 |
| --- | --- | --- |
| fade | 淡入淡出 | `type: 'fade'` |
| dialog | 缩放与淡入淡出 | `scale: 0.96`、`fade: true` |
| popupBottom / popupTop | 从下 / 从上平移 | Hook 默认距离 `32`；Popup 按面板自身尺寸覆盖 |
| drawerLeft / drawerRight | 从左 / 从右平移 | Hook 默认距离 `32`；Popup 按面板自身尺寸覆盖 |
| popover | 轻微缩放与淡入淡出 | `scale: 0.98`、`fade: true` |
| toast | 轻微缩放与淡入淡出 | `scale: 0.98`、`fade: true`；Toast 组件使用同一 preset |
| springScale | 弹性进入，定时退出 | `scale: 0.96`、`fade: true`、`overshoot: true`；进入 `damping: 14`、`stiffness: 280`、`mass: 0.9`，退出 `140ms` timing |

### 主题与行为边界

通过 `ConfigProvider` 的 `theme.seed.motion` 控制动效开关，`motionDurationMid` 提供 timing 默认时长。显式进入 / 退出时长优先于 preset 时长，preset 时长优先于主题默认值。主题关闭具有最终优先级，显式时长和 `reduceMotion: Never` 也不能绕过它。

Motion Hook 只负责视觉过渡，不负责 mount / unmount、`pointerEvents`、焦点、手势或 accessibility；新 `Transition` 则管理退出生命周期与隐藏状态。使用 Hook 时，调用方仍需管理可点击性和可访问性；纯缩放和平移的隐藏端点不代表内容完全不可见。

Web 文档预览使用 JavaScript 帧调度展示 timing 和 spring，便于比较效果；原生端使用 Reanimated。浏览器预览可用于判断视觉方向，仍需要在 iOS / Android 上观察实际动画和系统减少动态效果。
