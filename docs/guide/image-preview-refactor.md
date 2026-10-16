# ImagePreview 统一组件族重构记录

## 交付边界

公共入口为 `ImagePreview`、`ImagePreview.Provider`、`ImagePreview.Source`，类型归入 `ImagePreview` 命名空间前缀。删除原 `SharedImagePreview` 组件、Provider、类型、实现目录及独立文档，不保留兼容导出。

相册来自业务提供的 `items`，稳定 `id` 决定选中项；来源登记不能改变图片序列。消息单元回收或来源不可见时，查看器仍可浏览，关闭降级淡出。

## 实现职责

| 文件 | 唯一职责 |
| --- | --- |
| `src/image-preview/image-preview.tsx` | 组件族入口、根 Portal 和来源上下文桥接 |
| `image-preview-provider.tsx` / `image-preview-source.tsx` | 来源注册、可见性和测量 |
| `useImagePreviewInteraction.ts` | UI 线程上的手势、分页位置、缩放、偏移和动画取消 |
| `useImagePreviewSession.ts` | 打开关闭、来源交接、反转和会话回调失效 |
| `image-preview-content.tsx` | 数据与业务插槽、可访问性、安全区和虚拟列表组装 |
| `image-preview-page.tsx` / `image-preview-item.tsx` | 页内裁切和图片请求生命周期 |
| `preview-host.tsx` / `imperative.tsx` | 命令式入口复用来源范围及会话，宿主退出时清理 |

FlatList 仅承载虚拟页面，`scrollEnabled` 始终为 `false`。UI 线程的分页位置驱动原生 `scrollTo`，不再让原生惯性与自定义手势同时修改位置。

交互状态为 `idle`、`pan`、`paging`、`settling`、`pinch`、`dismiss`、`restoring`。图片内部与分页使用同一位移计算；反向移动退回页原点后自然交还图片。新双击/双指可结束分页归位并接管最近一页。每次取消增加 revision，旧回调不能重置新缩放。

会话状态为 `closed`、`opening`、`open`、`closing`，与手势状态独立。来源坐标在 Host 布局和窗口原点确定后转换；打开先等待可显示内容，有界等待失败后使用页面加载/错误画面。关闭先冻结 UI 快照，再确定来源：分页中外部关闭淡出当前页组合；稳定页关闭回到当前图片来源。归位完成后，在移除预览的同一次 React 提交中恢复来源，避免提前一帧同时展示两层图片。

## 已运行的验证

- 全仓 Jest：87 个套件、1324 项通过。后续会话/宿主边界调整另行运行聚焦回归。
- 最终图片预览聚焦 Jest：7 个套件、64 项通过，涵盖交接、取消、反转、整容器缩放、宿主清理、来源回收和加载。
- 包 TypeScript、全仓 ESLint、变更文件 Prettier 和 `git diff --check` 通过。
- 包构建、`release:check-package`、`changeset:status` 通过；本次版本变更为 major。
- Dumi 构建、Example TypeScript、配置解析、Web 导出通过。

## 未完成的原生验收

窗口恢复后，原生运行暴露 `[Worklets] Cannot copy value of type ComposedGesture`：动画闭包捕获了包含 Gesture 实例的控制器对象。已改为只捕获所需 SharedValue。iPhone 18 Pro / iOS 27.0 上已通过可访问性操作确认本地示例可打开、工具栏出现、关闭后来源入口恢复，未再出现该错误。

该修复后重新运行 TypeScript、受影响文件 ESLint、`git diff --check`，以及 4 个图片预览测试套件（38 项），均通过。Device Hub 截图返回倾斜缩小的窗口画面，尚不能据此可靠操作坐标或判定逐帧闪烁。以上检查不证明双指手感、闪烁、性能或 Harmony 支持；本次未提交、发布或升级依赖。

窗口恢复后逐项录屏验收：打开后立即双击/双指；放大到边缘后分页并反向退回；分页尚未结束时接管缩放；双指抬起后单指继续移动；首尾边界；缩小越界与回弹打断；放大状态关闭；关闭中重开；切图后回当前来源；首次网络加载与重试；来源回收；业务 Popup；Reduced Motion 与可访问性关闭。

原生验收通过前，不将重构标记为交互效果最终验收完成。
