---
'@ftsukic/tsuki': minor
---

Gesture 增加 RN thread 的 Pan onFinalize 与 Swipe onOpenChange，保留既有 worklet 回调、Swipe progress 和程序化开关语义。修复取消、动态禁用、范围变化和吸附打断，过滤过期完成事件，Tap 数量统一归一化。

Pressable 统一 pressed 状态与稳定 host，按压事件直接启动反馈；保持原生事件、点击节流和样式契约。Motion durationScale 同时调整 timing 与 spring，保留弹簧阻尼比。
