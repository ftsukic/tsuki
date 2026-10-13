---
'@ftsukic/tsuki': patch
---

修复 Search 在自动搜索配置变化或进入禁用、只读状态后仍执行待处理搜索的问题，并使 editable=false 的禁用视觉与 Input 一致。

新增 Search styles.container 定制可见输入框；styles.prefix 作用于完整前缀区域。空 left/action 不再生成带间距的容器。
