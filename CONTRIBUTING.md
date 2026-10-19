# Contributing

## Requirements

- Node.js 22+
- Corepack
- Yarn 4

## Checks

提交前运行：

```bash
yarn install --immutable
yarn typecheck
yarn lint
yarn test
```

提交信息遵循 Conventional Commits，例如：

```text
feat(ui): add Button
fix: 修复组件样式
```

本地 `pre-commit` 会检查 staged 文件的 ESLint 和 Prettier，`commit-msg` 会检查提交信息。发布前使用 Changesets：

```bash
yarn changeset
yarn release:version
yarn release:publish
```

组件源码、文档和 Expo 示例应保持单一来源；组件文档位于 `docs/components/`，交互示例复用源码旁的 canonical fixtures。
