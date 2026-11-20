# Motion 与交互运行时 Rule

本 Rule 定义 Motion、Pressable、Gesture 的实现约束。目标模块和阶段计划见 [`tsuki-v2-interaction-motion.md`](../../docs/architecture/tsuki-v2-interaction-motion.md)；当前实现状态必须检查源码，不得从目标架构推断。

## Motion

- 新增或迁移动画采用 Component → Motion Preset → Motion Primitive → Reanimated / Worklets。业务组件不得直接调用 `withTiming`、`withSpring`、`withDecay` 或自行定义基础 spring/easing 策略。
- Motion 能力保持内部。不得为了组件复用把 SharedValue、AnimatedStyle、Worklet、Motion Hook 或 Gesture 实例加入 package root exports。
- Motion 配置通过现有 `ThemeConfig` / `ResolvedTheme` 和 ThemeContext 解析，不另建 Provider。默认 `enabled: true`、`reducedMotion: 'system'`、`durationScale: 1`；`serializeTheme()` 不序列化 Motion policy。
- `durationScale` 为正数时缩放 timing 和 spring；spring 使用 `damping / scale`、`stiffness / scale²`、质量不变的参数关系。倍率为 0、Motion 关闭或 Reduced Motion 生效时直达目标，并执行完成回调。
- 系统 Reduced Motion 使用共享 `AccessibilityInfo` 订阅，允许系统设置实时变化；组件不得各自订阅系统设置。
- 动画反转从当前 SharedValue 接管；新目标取消旧动画；generation 或等价机制阻止过期回调覆盖新状态。退出动画完成后才能通知完成并卸载。
- 动画逐帧更新不驱动 React state。优先使用 opacity / transform；确需布局动画时由组件需求和平台行为单独验证。
- 预设与组件时长分开。组件可通过自己的 ComponentToken 覆盖时长，不复制或 fork 基础预设。

## Pressable

- 按压运行时以 React Native `Pressable` 为事件基础，以 Reanimated 驱动视觉反馈；初期接入 Button 和 Cell 不改变它们现有公共 Props。
- 事件顺序、disabled、原生 press props、render props/style 状态和 Accessibility 语义遵循 `.agents/rules/api-design.md`。普通视觉反馈不依赖 React state。
- `className` 负责静态 NativeWind 样式，`animatedStyle` 负责 SharedValue 驱动的动态样式；不得使用 `cn` / `tailwind-merge` 合并动态值。同一属性发生冲突时，显式 `styles.root` / `style` 高于 pressed feedback；feedback 不覆盖被显式样式占用的属性。

## Gesture

- Gesture 基于 RNGH；初期优先 Pan、Swipe。连续手势位移、方向锁定和释放决策留在 UI thread，仅在结束、取消或离散业务事件时通过 `scheduleOnRN` 通知 JS。
- 嵌套滚动必须显式设计 simultaneous 与 `requireExternalGestureToFail` 等关系。App 根部需要 `GestureHandlerRootView`，不得假设 TsukiProvider 提供它。
- 手势吸附、velocity projection、decay、resistance 和 spring back 复用 Motion 策略，不另建逐帧 JS 驱动。

## 验收边界

- 自动化聚焦行为：倍率归一化和 spring 参数、反向接管、旧回调失效、Reduced Motion 完成通知、Pressable 事件顺序、Gesture 方向锁、阈值/速度、Snap 和 Resistance。
- NativeWind v4 与 v5 使用独立 Consumer 验证类型、构建、配置、iOS/Android bundle，以及 `className` 与 `animatedStyle` 组合。
- 静态检查、Mock 测试和 bundle 不能证明原生行为。iOS 与 Android 要分别做原生验证；Harmony 必须验证具体 RNOH 宿主、Reanimated、Gesture Handler、Worklets 与设备表现。
