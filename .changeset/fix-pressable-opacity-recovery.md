---
'@ftsukic/tsuki': patch
---

修复 Button 解除禁用或结束加载后可能保留禁用透明度的问题。共享 Pressable 动画在移除透明度覆盖时显式恢复为 1，并保留自定义透明度优先级。
