---
'@ftsukic/tsuki': major
---

移除 Tsuki JS Portal 实现与可选后端配置，改为直接依赖 react-native-teleport。应用必须在 TsukiProvider 外挂载 PortalProvider；函数式弹层由 TsukiProvider 内的 React 承载器渲染至 Teleport root。移除 Tsuki 的 Portal、PortalHost 和底层 mount/update/unmount 导出。
