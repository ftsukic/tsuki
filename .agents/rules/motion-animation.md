# Motion Animation Rule

- 新增或迁移动画采用 Component → Motion Preset → Motion Primitive → Reanimated / RNGH。组件不直接定义 withTiming、withSpring、Easing、独立 duration 或 spring 参数。
- 使用 src/motion/token.ts 和 semantic-presets.ts；组件时长仍允许通过现有 ComponentToken 覆盖。手势吸附使用 motion/gesture.ts，手势逐帧更新留在 UI thread。
- Motion 配置使用现有 Provider / ConfigProvider 的 ThemeContext。局部关闭、全局关闭、Reduced Motion 和时长倍率由 useMotionConfig 统一解析；不得另建 Theme Provider 或逐组件读取系统 accessibility。
- 退出必须先完成动画，再触发完成事件和卸载；反转取消旧目标及已排队的旧回调。退出期间禁用 pointer events 和隐藏 accessibility。
- 普通动效优先 opacity / transform；Collapse 的高度与 Segmented 的绝对定位背景宽度属于已有布局例外。
- 保留现有公共 export、Prop、ref、受控行为、semantic style 和 Portal identity。兼容 Hook / Reanimated export 不得在普通重构中删除；新 API 不暴露 SharedValue 或 worklet。
- 未迁移的旧动画允许保留；记录调用点和迁移边界，不新增并列驱动。外部 Popover 引擎不能仅通过策略适配就宣称已迁移到 Reanimated。
- 静态检查、Mock 测试和 Web 预览不能证明 iOS / Android / Harmony 原生行为。Harmony 验收需宿主适配版本、HAP 和真实设备证据。
