# 架构 Rule

## public / internal 边界

- `packages/tsuki/src/index.ts` 是 package entry surface。组件 `index.ts` 是该组件或组件族的 public barrel。
- 已由组件 barrel 或根 `packages/tsuki/src/index.ts` 导出的 API 是当前兼容面。internal refactor 不得删除、重命名或将这些 export 降级为 `internal`。现有 export 不自动代表未来新增 API 的推荐方式。
- 新的 root export 必须有清晰、稳定的公共用途。不得仅为了跨组件复用而提升 private helper、hook、context、state object、column generator、normalization function 或 implementation-only component。
- public barrel 中不得包含 implementation detail。`index.ts` 只导出 public component、public type 和明确设计为 public 的 helper，不放实现逻辑。
- internal implementation 和 tests 优先从真实 private path 获取 helper、context、manager、hook 和其他 support module，不要把 public barrel 当作内部依赖入口。
- 不得仅为测试方便把 helper、context 或 manager 提升为 public export；这会把实现能力变成需要长期维护的 compatibility debt。
- 普通 refactor 不得删除已有 export。兼容期内应保留现有 export，同时让 internal code 改用真实 private path、让 tests 直接验证 private path；未来 major 再单独评估是否移除。

## import 与 dependency direction

- 当依赖确实是正式的 public dependency 时，正式 public component 可以通过其 component barrel import sibling public component。
- private implementation 不得通过 public barrel 绕回另一个 private implementation。private helper 应从真实文件或 internal-domain path import。
- 依赖应从 public entry point 和 component implementation 指向 support module。避免 component barrel、implementation file 与 private helper 之间形成循环。
- 如果多个 component 共享 private domain capability，应将它放在所属 component 下或清晰命名的 internal domain module 中。不得仅因为多个 component 复用就创建新的 public component 或 root export。
- internal domain module 必须表达真实职责；当 barrel 没有价值时可以不创建 `index.ts`，并且不得从 `packages/tsuki/src/index.ts` 导出。

## Interaction runtime 边界

- 交互运行时按 Motion、Pressable、Gesture、Overlay 分责。Motion 是动画底层能力，不依赖业务组件；Pressable 和 Gesture 可依赖 Motion；业务组件通过这些内部运行时接入交互。
- 每个 React Root 只有一个 Overlay Host 所有者：根 `TsukiProvider` 创建该 Root 的 `OverlayRegistry` 并拥有唯一 `OverlayHost`。Host 位于根 `ThemeContext` 作用域内，生命周期不依赖 Screen 或页面组件。嵌套 `TsukiProvider` 和 `ConfigProvider` 只提供主题作用域；嵌套 `TsukiProvider` 继承所属 Root 的 Registry，不创建 Host。`ConfigProvider` 不创建 Host 或 Registry。React Native `View` 是三端 Host 的共同基线，不依赖 Teleport 或平台 Portal API。
- iOS 可在 Batch 16B.0 中单独验证 `react-native-screens FullWindowOverlay`。在验证需要且通过 Accessibility、层级和触摸验收后，才将它作为可选原生层包装；它不取代每 Root Registry、Host 所有权或 Context Bridge，也不是强制依赖。Android 和 HarmonyOS 保持共同 View Host 合约。
- 根 Provider 通过不进入 public exports 的内部 Overlay Runtime Context 向子树传递 Registry。组件树内调用从该 Context 解析 Root Registry 并捕获当前位置的 `ResolvedTheme`；组件树外调用必须显式绑定到所属 Root 的内部 controller。无法确定 Root 时必须失败；不得使用模块级 `activeRendererId`、最后注册 Renderer 默认目标、全局 Registry，或让 Registry 推断调用者 ThemeContext。现有 v2 组件命令式 API 的 Root 绑定须由后续组件 API 集成审查解决，不得声称任意树外调用已支持。
- 每个 Root 的 Overlay Runtime 使用内部 `OverlayRegistry` 管理挂载、更新、卸载、Host 注册和 Back 分发。Registry 不实现 Toast、Dialog、Popup 等业务语义或动画；Entry 更新不改变层级顺序，卸载必须清理 Entry 与回调。
- Overlay 沿用现有 `ThemeContext` 和 `ResolvedTheme`。内部 Theme Context Bridge 保留声明式调用处的主题作用域，并让树外命令式调用使用根 TsukiProvider 的主题；不得新增 Theme Provider，也不承诺桥接任意业务 React Context。
- Overlay 的打开、关闭语义由组件负责，动画由 Motion Runtime 负责；退出动画完成后才卸载 Entry。Registry 不直接实现动画。
- Registry 用 `hidden`、`entering`、`entered`、`exiting` 记录 Entry Presentation Phase 和生命周期 generation；退出中 Entry 仍属于 Registry、保持稳定 React Key 且继续作为 Back 目标。Motion 通过独立的 Mask / Content SharedValue 通道播放动画，两通道全部成功完成后才允许 Registry 卸载；重开时使旧 generation 完成回调失效。
- Android 与 HarmonyOS 使用统一语义，每次 Back 只交给最顶层可见 Entry：`dismiss` 调用其关闭回调并消费、`consume` 消费但不关闭、`passthrough` 交给导航或系统且不向下扫描。`dismiss` 必须有关闭回调；没有 Entry 时交给导航或系统。共享组件 contract 集中定义默认行为，避免组件各自采用隐式默认值。不得跳过顶层 Entry 关闭底层 Entry，也不得让每个浮层单独注册 Back 监听。iOS 不模拟 Android Back。
- `unregisterHost` 只解除 Host 注册，不清空 Registry 中的已挂载或待渲染 Entry；Host 重新注册必须幂等并恢复原挂载顺序。Host 自身订阅和平台监听随注销清理。Host cleanup 不等于 Root disposal；React StrictMode Effect cleanup/setup replay 必须能重新注册同一 Root Registry。Root 永久销毁时才释放其 Entry、回调和订阅；若使用显式 `disposeRoot`，必须保证 StrictMode 下正确恢复。
- Host 根容器必须允许无关区域的底层触摸穿透；仅浮层内容和明确的遮罩拦截其拥有的区域。Safe Area、Keyboard、锚点定位和浮层 accessibility 语义由具体组件负责，Host 不统一接管。
- React Native `Modal` 只用于确实需要独立原生窗口的功能，不作为通用 Overlay Host。Overlay 不承诺覆盖 Native Modal 或独立原生 Window。
- 上述运行时属于 private capability module，不因目录名或内部 barrel 自动成为 public component 或 package API。不得引入通用 `domain/` 层来承载它们。
- 不得从 package root 暴露 `OverlayRegistry` 或其他 Overlay Runtime 实现细节。
- 运行时职责、依赖图和阶段范围见 `docs/architecture/tsuki-v2-interaction-motion.md`；实现状态以源码和 package 配置为准。

## root export

- 只有当 consumer 需要稳定且有文档支持的 public contract 时，才添加 root export。
- 添加或修改 export 前，检查受影响的 component barrel、`packages/tsuki/src/index.ts`、package exports 和当前 consumer/tests。
- 不要把 public export 当作测试或跨组件访问 internal 的捷径。应调整 import boundary，或通过 public behavior 测试。
- 当 legacy export 不够理想但仍需支持时，保留它并记录 compatibility decision；不要在无关 refactor 中静默改变其形状。
- 已经意外公开的 internal capability 仍属于当前兼容面；边界收敛应先停止内部继续依赖 public barrel，再通过明确的 major 变更评估删除，而不是在普通 refactor 中直接删除。

## Review 边界

- 先将现有 export graph 视为必须保留的事实，再单独评估未来 API design。
- 不要把 architecture cleanup 混入命名、样式、文档或测试变更。任何 public-surface redesign 都应作为明确的后续任务。
