# 测试 Rule

## 应测试的内容

- 测试 public behavior 和重要的 domain behavior，而不是 private implementation shape。
- Component test 通常位于 `src/__tests__/`；已有 colocated test directory 仍然有效，不要仅为一致性而移动它们。
- Pure logic test 使用面向行为的名称，例如 `picker-date-time.test.ts` 或 `image-preview-utils.test.ts`。
- 对 stateful component，覆盖 controlled 和 uncontrolled operation、default、state transition、callback 以及重要 edge case。
- 当 component 暴露 accessibility 时，覆盖其 semantic 和 action。
- 当 theme override、token effect、semantic styles 和 style precedence 属于 contract 时，覆盖这些行为。
- 通过受支持的 public surface 测试 compound component behavior 和 public imperative API。

## 边界与禁止事项

- 不要仅为了测试而暴露 internal API、helper、context 或 component。
- 当 public behavior 可以表达 contract 时，不要让测试依赖偶然的 implementation detail。
- 避免大量脆弱的 snapshot suite；使用聚焦断言验证 consumer 依赖的 behavior、accessibility、token 和 rendered output。
- 测试必须与当前 public export 和 documented behavior 一致。已有测试是 contract 的证据，不代表需要保留错误的 implementation detail。

完整仓库质量门禁由 `.github/workflows/ci.yml` 定义。具体变更的命令选择属于 `verify-change`；本 Rule 只定义覆盖范围和边界。
