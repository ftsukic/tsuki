# Tsuki

Tsuki 是一个 React Native UI 组件库。当前工作集中在 v2 框架和 Button / Input canary；完整 1.x 源码继续保留为历史参考。

## Workspace

| 路径                           | 用途                                         |
| ------------------------------ | -------------------------------------------- |
| `packages/tsuki/src/`          | Tsuki v2 源码和当前公共入口                  |
| `packages/tsuki/bak/src/`      | 完整 1.x 源码归档，只读参考                  |
| `apps/playground/`             | 使用归档源码的 1.x 历史 Playground           |
| `apps/nativewind-v4-consumer/` | 独立 NativeWind 4 / Tailwind 3 集成消费者    |
| `apps/nativewind-v5-consumer/` | 独立 NativeWind 5 RC / Tailwind 4 集成消费者 |
| `docs/`                        | v2 架构说明、v2 canary API 和保留的 1.x 指南 |

## 开发

需要 Node.js `^22.13.0 || >=24` 和 pnpm 12.19.0。

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run format:check
pnpm run release:check-package
```

`typecheck` 包括 v2 package、两个 Consumer 和历史 Playground。`test` 包括归档 1.x Jest、v2 canary 测试和 Playground 测试。旧 Fixture Generator 只扫描 `packages/tsuki/bak/src`：

```bash
pnpm run fixtures:generate
pnpm run consumer:v4:config
pnpm run consumer:v5:config
pnpm run consumer:v4:build:development
pnpm run consumer:v5:build:development
```

完整的 v2 Theme / Style、Consumer 和发布边界见 [项目框架文档](docs/architecture/tsuki-v2-project-framework.md)。发布仍由 Changesets 管理；本次 major 变更意图保存在 `.changeset/`，不手工修改 package version。
