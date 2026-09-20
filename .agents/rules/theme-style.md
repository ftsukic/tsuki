# Theme / Style 规则

## Token 分层

当前 Theme model 按以下层级组织：

```text
SeedToken -> MapToken -> AliasToken -> ComponentToken
```

- `SeedToken` 包含基础 theme input；`MapToken` 派生 palette、typography、size、motion 等映射值；`AliasToken` 提供可复用的 semantic design value；`ComponentToken` 包含 component-specific override。
- 使用现有的 `MappingAlgorithm`、`ConfigProvider`、`useToken` 和 `useComponentToken` contract。修改 token 或 theme behavior 前，读取 `src/theme/`。
- 设计系统共享的值优先使用 `AliasToken`。只有真正属于单个 component 且应允许 consumer 配置的值，才放入 `ComponentToken`。
- 保留 theme inheritance、override、dark/default algorithm、motion duration 和 hairline behavior。不要把 theme change 伪装成 context 或 naming cleanup。

## Component styling

- Public `style` / `styles` API semantics 由 `api-design.md` 定义。本 Rule 负责 semantic slot design、style resolution、precedence 和 theme integration。
- Semantic slot name 应与 UI meaning 相关。避免使用 `wrapper1`、`leftBox`、`innerView` 或 `content2` 等位置名称。
- 通过现有 style 和 token helper 解析样式，不要用 ad hoc constant 绕过 theme override。
- 只有 component 存在独立且可配置的 visual variable 时，才创建 component token definition。不要为了目录对称而创建空的 `token.ts`。

## 变更边界

- 修改 styling 前，检查受影响 component 的 `style.ts`、token factory、type、theme provider usage 和测试。
- 不要将 token derivation、style precedence 或 public semantic slot 的变更作为 file-structure 或文档变更的附带内容。
