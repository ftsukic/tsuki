---
'@ftsukic/tsuki': major
---

将 SharedImagePreview 与 ImagePreview 整合为 ImagePreview 组件族。来源注册使用 ImagePreview.Provider，缩略图使用 ImagePreview.Source；删除旧组件、Provider、类型和独立入口，不保留别名或兼容层。

图片分页、缩放、移动、退出拖动统一由 UI 线程交互控制器处理。关闭 FlatList 原生滚动，保留虚拟化页面承载；支持同次手势在图片移动与分页之间双向交接、取消分页保留缩放，以及双击/双指立即接管分页归位。独立会话管理器统一来源测量、画面显隐交接、动画反转和旧回调失效。声明式与命令式使用同一来源范围与查看器。

保留全屏区域 500ms 长按回调、业务 Popup 触摸隔离、原图加载与失败重试，并同步迁移全部示例和文档。

ImagePreview.Source 支持 clipRef 登记列表可视区域，来源部分位于列表上下边界时，归位同步插值裁切范围，避免浮动图片在交接时越过列表覆盖周边内容。

通过 type: video 与 renderMedia 扩展视频页，复用统一分页、变换和来源交接；向播放器提供 active / playing 生命周期状态，图片预加载仅处理视频封面，Example 使用 react-native-video 验证混合相册。
