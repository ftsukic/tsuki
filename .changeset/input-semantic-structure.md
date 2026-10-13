---
'@ftsukic/tsuki': major
---

重构 Input 语义结构：root 控制整体布局，新增 container 控制输入框；prefix、suffix 和 addon 改为稳定的 View 区域，样式类型改为 ViewStyle，不保留旧 API 映射。迁移 Search，补齐单行计数和隐藏清除按钮的无障碍状态，多行高度采用最终文字行高。

默认关闭聚焦边框高亮，通过 focusedBordered 显式开启；单行计数使用居中行内布局，移除多行计数的定位偏移。

修复 autoSize 测量宽度与可见输入不同导致的换行裁切，并在 Web 受控值更新时主动测量 scrollHeight。

隐藏测量节点的 numberOfLines=1 仅用于 Web，原生平台不限制测量行数。

iOS 在内容或宽度变化时重新创建隐藏测量节点，修复 contentSize 缓存导致删除后高度不缩回。
