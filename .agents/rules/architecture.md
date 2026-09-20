# 架构 Rule

## public / internal 边界

- `src/index.ts` 是 package entry surface。组件 `index.ts` 是该组件或组件族的 public barrel。
- 已由组件 barrel 或根 `src/index.ts` 导出的 API 是当前兼容面。internal refactor 不得删除、重命名或将这些 export 降级为 `internal`。现有 export 不自动代表未来新增 API 的推荐方式。
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
- internal domain module 必须表达真实职责；当 barrel 没有价值时可以不创建 `index.ts`，并且不得从 `src/index.ts` 导出。

## root export

- 只有当 consumer 需要稳定且有文档支持的 public contract 时，才添加 root export。
- 添加或修改 export 前，检查受影响的 component barrel、`src/index.ts`、package exports 和当前 consumer/tests。
- 不要把 public export 当作测试或跨组件访问 internal 的捷径。应调整 import boundary，或通过 public behavior 测试。
- 当 legacy export 不够理想但仍需支持时，保留它并记录 compatibility decision；不要在无关 refactor 中静默改变其形状。
- 已经意外公开的 internal capability 仍属于当前兼容面；边界收敛应先停止内部继续依赖 public barrel，再通过明确的 major 变更评估删除，而不是在普通 refactor 中直接删除。

## Review 边界

- 先将现有 export graph 视为必须保留的事实，再单独评估未来 API design。
- 不要把 architecture cleanup 混入命名、样式、文档或测试变更。任何 public-surface redesign 都应作为明确的后续任务。
