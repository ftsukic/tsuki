---
name: verify-change
description: 仓库变更后，用于根据变更范围选择验证命令、检查变更路径，并只报告实际运行过的检查。
---

# 验证变更 Skill

该 Skill 用于编辑完成后的验证。先读取适用的 Rule，检查实际变更路径，再选择能够证明变更正确性的最小验证。不要报告未运行的命令。

1. 检查 `git status --short`、`git diff --name-only` 和 diff scope。保留并单独报告无关的预-existing work。
2. 对 Agent Context、Markdown 或其他 documentation-only structure change，运行 `git diff --check` 等结构检查，并检查 changed-file list 和 diff。不要暗示已经验证 source test、build 或 device behavior。
3. 对 private implementation/helper change，运行 package typecheck 和相关的聚焦测试。
4. 对 component behavior change，运行 package typecheck、相关的聚焦测试，以及项目会检查该代码时的 lint。
5. 对 Public API change，运行 typecheck、相关 test suite、lint 和 build；通过仓库已配置的 script 确认 export 和 package behavior。
6. 对 Fixture 或 public documentation change，运行适用的 docs build 和 example/Fixture validation。只有变更行为确实需要时，才增加 typecheck 或聚焦测试。
7. 对完整仓库变更，按照 `.github/workflows/ci.yml` 对齐验证，不要将 CI workflow 复制到本 Skill。
8. 记录命令名、exit status 和有意义的 failure。区分 pre-existing failure 与 regression，并区分 static/build proof 与 runtime 或 device proof。

Rule 定义变更必须保留的内容；本 Skill 定义所选范围应运行哪些检查。
