---
'@ftsukic/tsuki': minor
---

新增独立 @ftsukic/tsuki/teleport 入口，通过 portalBackend 配置 Teleport。默认 JS 入口无需安装 Teleport。teleport 属性弃用，启用时须迁移到显式后端配置。声明式浮层使用稳定的非阻塞容器，保持子节点重建时的叠放顺序。
