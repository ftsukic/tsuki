# Tsuki

Tsuki 是一个 React Native UI 组件库，使用 pnpm monorepo 维护。

## Workspace

| 路径               | 用途                                           |
| ------------------ | ---------------------------------------------- |
| `packages/tsuki/`  | 发布到 npm 的 `@ftsukic/tsuki` 组件包          |
| `apps/playground/` | 用于浏览组件和 canonical fixtures 的 Expo 应用 |
| `docs/`            | 开发指南和组件文档                             |

组件源码和 canonical fixtures 位于 `packages/tsuki/src/`。Playground 的组件目录由这些 fixtures 生成，文档与应用复用同一份示例。

## 开发

需要 Node.js `^22.13.0` 或 `>=24`，以及 pnpm 12.19.0。

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run format:check
```

启动 Playground 或在原生目标上运行：

```bash
pnpm run playground:dev
pnpm run playground:ios
pnpm run playground:android
```

使用 Changesets 管理发布说明；发布包的 manifest、构建产物和 changelog 位于 `packages/tsuki/`。

```bash
pnpm run changeset
pnpm run release:version
pnpm run release:publish
```

更多信息见 [贡献指南](CONTRIBUTING.md)、[快速开始](docs/guide/index.md) 和 [组件包 README](packages/tsuki/README.md)。
