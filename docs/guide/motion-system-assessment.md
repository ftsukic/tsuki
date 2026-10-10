---
title: Motion System 仓库评估
---

# Motion System 仓库评估

当前 Motion 使用现有 Provider / ThemeContext，按 Component → Preset → Primitive → Reanimated / RNGH 组织。直接统一当前设计，不维护旧版本别名或兼容参数分支。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| `src/motion/token.ts` | 时长、距离、缩放、spring 与反馈设计值 |
| `src/motion/easing.ts` | 统一缓动曲线 |
| `src/motion/effects.ts` | 基础过渡效果与强调 spring 效果 |
| `src/motion/presets.ts` | Press / State / Layout / Overlay / Feedback / Gesture 场景配置与公开 `motionPresets` |
| `src/motion/animation.ts` | 数值动画及 Web spring 采样 |
| `src/motion/transition-style.ts` | 过渡进度到 opacity / transform 的映射 |
| `src/motion/transition.tsx` | Transition 生命周期、退出卸载与 accessibility |
| `src/motion/motion-view.tsx` / `motion-pressable.tsx` | 属性动画与按压反馈组件 |
| `src/motion/useTransitionProgress.ts` / `useAnimatedTransition.ts` | 同名过渡 Hook |
| `src/motion/useMotionValue.ts` | 共享数值驱动与中断完成处理 |
| `src/motion/useMotionConfig.ts` / `useReducedMotion.ts` | 全局策略与共享系统减少动态订阅 |
| `src/motion/useCollapseMotion.ts` / `useCollapseMotion.native.ts` | Web 布局事件与原生 UI thread 测量 |
| `src/motion/useFeedbackMotion.ts` / `gesture.ts` | 反馈动画与手势吸附 |

组件及支持文件使用 kebab-case；Hook 使用 camelCase，同名文件承载同名 Hook；平台差异使用 `.native.ts`。Fixture 使用 `overview.tsx`、`style.ts` 与 `examples/<scenario>.tsx`，Dumi 与 Expo 复用相同场景文件。

## 当前接入

Popup / Overlay / Notify / Toast / Dropdown / Pressable / Switch / Checkbox / Radio / Collapse / Loading / Skeleton / SwipeCell / Tabs 指示器 / Segmented 已使用统一能力。Dialog / ActionSheet / Button 通过原有组件组合接入。

Popover 只接入策略，定位与动画仍由外部库执行。Progress / FloatingPanel / Swipe / ImagePreview / Picker 等复杂旧驱动尚未统一迁移；Tabs 内容切换仍复用 Swipe。未迁移驱动使用主题关闭和 Reduced Motion 状态，但不统一应用 durationScale。

Popup 保持 Portal identity，面板和遮罩共享进度；组件时长继续通过现有 duration 或 ComponentToken 覆盖。motion=false 和 Reduced Motion 当前采用即时完成，保留状态变化、完成事件及即时按压反馈。

## 示例

十个独立场景分别展示退出卸载、属性动画、基础效果、全局策略、语义 preset、快速反转、反馈动效、组件接入、Hook 和共享进度。退出示例有明确空态；属性动画使用固定卡片尺寸与裁切边界；基础效果各自显示隐藏状态，避免一条生命周期文字解释整页。

## 验证边界

静态检查、Mock 测试、Web 构建和浏览器交互只能证明相应范围。iOS / Android 仍需原生构建与设备验证；仓库没有 Harmony 工程，需要宿主适配版本、HAP 与真实设备证据。

Transition 的 slide 在尺寸测量完成后启动首次进入，退出卸载后重新测量。文档静态适配器单独使用 JavaScript 帧调度；正常 Web 与原生使用 Reanimated 驱动。
