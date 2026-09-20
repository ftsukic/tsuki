---
name: refactor-component
description: 重构现有 Tsuki 组件并保持其 Public API、已记录行为、兼容面和聚焦回归覆盖时使用。
---

# 重构组件 Skill

该 Skill 用于已有 component refactor。编辑前读取适用的 Rule；不要将 Rule 的详细约束复制到任务计划中。

1. 盘点当前 component barrel、root export、public type、documented behavior、聚焦测试、theme/style contract 和已知 consumer。
2. 区分兼容面与 private implementation。除非任务明确修改 public API，否则将现有 component 和 root export 视为必须保留的 surface。
3. 确定 refactor boundary 和 dependency direction，识别可以移动且不改变 import 或 public export 的 private domain helper。
4. 在该 boundary 内重构 implementation。正式 public component 之间可以使用 sibling component barrel，但不得让 private implementation 通过 public barrel 绕回内部。
5. 保持 controlled/uncontrolled behavior、callback、accessibility、compound API、semantic styles、token 和 deprecated compatibility behavior。
6. 只添加变更行为所需的聚焦回归测试；不要暴露 internal API，也不要重写无关测试。
7. 只有 public behavior 或 documented usage 发生变化时，才更新 canonical Fixture 和文档。
8. 使用 `verify-change` 进行验证，并只报告实际运行过的命令。

相关 Rule：`architecture`、`component-structure`、`api-design`、`theme-style`、`docs-fixtures` 和 `testing`。如果 refactor 改变 published behavior，还要读取 `release`。
