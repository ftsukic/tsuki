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
yarn docs:build
```

组件源码、文档 demo 和 Snack 示例应保持单一来源，避免在 MDX 中复制维护第二份组件实现。
