---
'@ftsukic/tsuki': patch
---

修复 FloatingBubble 磁吸对统一 Motion 策略的支持，以及拖动、位置更新和卸载后的旧动画回调。首次定位前隐藏交互与无障碍节点；直接通过 icon 传入的 Tsuki Icon 使用气泡颜色和尺寸 token，显式 props 保持优先。children 为 null 时不再回退显示 icon。

磁吸改用快速、轻微回弹的 spring，支持松手速度与动画速度倍率；边界使用实际 Portal.Host 可用区域，回弹限制在可见安全区域内。Example 的 FloatingBubble 和 FloatingPanel 使用页面级 Host，页面失焦时释放浮层及局部宿主。
