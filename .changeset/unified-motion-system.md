---
'@ftsukic/tsuki': major
---

新增 Transition、MotionView、MotionPressable 与 Provider/theme MotionConfig，统一动画 Token、Reduced Motion 和过渡中断处理。迁移核心浮层、按压、状态、折叠、反馈、Tabs/Segmented 和 SwipeCell 动画，SwipeCell 增加可选的 overshoot 阻尼。

直接统一 Motion preset：dialogSoft 合并到 dialog，dialog 采用 0.96 缩放淡入，toast 与组件统一为 0.98 缩放淡入；移除 MOTION_DEFAULT_* 与 getTransitionStyle 的公共导出。Pressable 默认按压缩放为 0.96，默认 spring 使用 normal，scale 与 slide 的透明度过渡统一由 fade 控制，无旧版本兼容层。

按职责整理 Motion 文件与场景示例，统一 kebab-case 示例命名和同名 Hook 文件。拆分生命周期、属性动画和效果对比，明确卸载空态及展示边界，并修复 Web Collapse 布局更新。
