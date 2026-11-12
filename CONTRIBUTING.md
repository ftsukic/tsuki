# Contributing

## Requirements

- Node.js 22+
- pnpm 12.19.0 (the version is pinned in the root `package.json`)

## Checks

提交前运行：

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

提交信息遵循 Conventional Commits，例如：

```text
feat(ui): add Button
fix: 修复组件样式
```

本地 `pre-commit` 会检查 staged 文件的 ESLint 和 Prettier，`commit-msg` 会检查提交信息。发布前使用 Changesets：

```bash
pnpm run changeset
pnpm run release:version
pnpm run release:publish
```

组件源码、文档和 Expo Playground 应保持单一来源。组件源码及 canonical fixtures 位于 `packages/tsuki/src/`，组件文档位于 `docs/components/`，Playground 通过 workspace 依赖 `@ftsukic/tsuki` 并复用这些 fixtures。
