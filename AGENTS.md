# AGENTS.md

## 项目定位

- `@ftsukic/tsuki` 是一个 React Native UI 组件库。源码入口是 `src/index.ts`。
- Markdown 指南和组件文档位于 `docs/`；Expo Example 位于 `example/`。
- `.agents/` 包含显式的项目 Context。不要假设每个 Agent 都会自动加载它。

## 执行原则

- 修改文件前，必须读取 `.agents/` 中相关的 Rule 和 Skill。所有与变更匹配的 Rule/Skill 都要读取；路由不会自动生效。
- 在决定如何变更之前，读取定义受影响行为的实际源码、配置、脚本、文档和 CI。
- 除非任务明确授权 breaking change，否则必须保留现有 Public API 和用户可观察行为。现有 export 是兼容面，即使它们不是未来新增 API 的推荐设计。
- 将变更限制在请求范围内。保留无关的 dirty worktree 变更，避免 destructive Git command，不要进行无关的批量重命名或重构。

## 事实来源

- 冲突按以下顺序处理：实际源码/配置/CI、当前项目文档、项目 Context（`AGENTS.md` 和 `.agents/`），最后才是推断。
- 涉及 public export 时，读取 `src/index.ts` 和相关组件的 `index.ts`。
- 涉及 theme 和 styling 时，读取 `src/theme/`、`src/style/` 以及受影响的组件实现。
- 涉及 Fixture 和文档时，读取 Fixture generator、受影响的 Fixture，以及存在时对应的组件文档。
- 涉及测试时，读取聚焦测试；需要质量门禁时读取 `.github/workflows/ci.yml`。
- 涉及 release 时，使用 `docs/releasing.md`、`.github/workflows/publish.yml`、`.changeset/` 和 release validation scripts 作为事实来源。不要用 Rule 摘要替代这些事实。

## Context 路由

| 工作范围 | 优先读取 |
| --- | --- |
| public/internal 边界、export、import、dependency direction | `.agents/rules/architecture.md` |
| Component 目录、文件名、support module、Hook | `.agents/rules/component-structure.md` |
| Props、types、callback、ref、compatibility、accessibility | `.agents/rules/api-design.md` |
| Theme token、provider、style、semantic slot | `.agents/rules/theme-style.md` |
| Motion、动画策略、过渡生命周期、手势吸附 | `.agents/rules/motion-animation.md` |
| Fixture、组件文档、Expo Example 复用 | `.agents/rules/docs-fixtures.md` |
| 测试范围和行为覆盖 | `.agents/rules/testing.md` |
| Changeset、versioning、publishing | `.agents/rules/release.md` |

跨范围变更要读取所有适用的 Rule。执行工作流前也要读取匹配的 Skill。

## Skill 路由

- 新建 Component：`.agents/skills/create-component/SKILL.md`
- 重构已有 Component：`.agents/skills/refactor-component/SKILL.md`
- Component 文档或 Fixture：`.agents/skills/document-component/SKILL.md`
- 验证选择与结果报告：`.agents/skills/verify-change/SKILL.md`

Rule 定义稳定约束。Skill 定义执行流程，必须引用 Rule，而不是复制 Rule 的详细内容。

## 验证原则

- 使用 `verify-change`，根据实际变更范围选择验证。只运行适合该范围的命令，并准确报告实际运行过的内容。
- 完整质量门禁以 `.github/workflows/ci.yml` 为准；不要在项目 Context 文件中复制或弱化它。
- 文档/Context-only 变更使用结构检查。代码、Public API、Fixture 和 release 变更则使用相关 Skill 与源码配置要求的聚焦验证。
- 成功的 static check 或 build 不能证明 device behavior；未运行的命令绝不能报告为已运行。
