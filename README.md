# Tsuki

Tsuki 是一个 React Native UI 组件库。Tsuki v2 是当前主线；完整 v1 源码保存在 `packages/tsuki/bak/src/`，仅用于历史参考和 Legacy Playground。

## 当前工作区

| 路径 | 用途 |
| --- | --- |
| `packages/tsuki/src/` | Tsuki v2 源码和正式公共入口 |
| `packages/tsuki/bak/src/` | 已归档的 v1 完整源码，不参与 v2 构建或 npm 包 |
| `packages/tsuki/dist/` | 由构建生成的 CommonJS、ES Module、TypeScript 声明和 CSS 资源 |
| `apps/playground/` | 正式开发工作台：v2 与 Legacy v1 组件、Theme Playground、Design Tokens |
| `apps/nativewind-v4-consumer/` | 独立 NativeWind v4 集成验证应用 |
| `apps/nativewind-v5-consumer/` | 独立 NativeWind v5 集成验证应用 |
| `packages/consumer-fixtures/` | 两套 Consumer 共享的内部验证场景，不发布到 npm |
| `docs/` | v2 组件、Theme、架构和历史 v1 指南 |

Playground 的 Fixture Manifest 当前包含 **64 个目录入口**：9 个 v2 组件入口和 55 个 Legacy v1 入口。9 个 v2 入口对应 73 个 runnable 示例。主题系统有 10 个 Semantic Token 和 Button、Input、Divider、Surface、Card、Cell 六组 Component Token。Manifest 是组件目录的唯一示例来源。

## 开始使用

安装和最小接入步骤见 [npm package README](packages/tsuki/README.md)。完整 API 页面见[组件文档](docs/components/index.md)；主题指南见 [Theme v2](docs/components/v2/theme/index.md)。

## 开发

仓库要求 Node.js `^22.13.0 || >=24` 和 pnpm `12.19.0`。

```bash
pnpm install --frozen-lockfile
pnpm run fixtures:check
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm run test
pnpm run build
pnpm run release:check-package
pnpm run consumers:config
pnpm run consumers:tarball
pnpm run playground:config
pnpm run playground:typecheck
pnpm run playground:test
```

`pnpm run test` 覆盖归档 v1 测试、v2 测试和 Playground 测试。`pnpm run consumers:tarball` 会将构建好的 npm tarball 分别安装到临时的 v4、v5 Consumer 中，运行类型检查、Expo 配置和 iOS/Android development bundle 验证。

NativeWind 版本保持在两个独立应用内；共享场景包只导入 `@ftsukic/tsuki` 公共入口。Consumer 配置和本地 Android 命令见[架构指南](docs/architecture/tsuki-v2-project-framework.md)。

## 链接

- [npm 接入指南](packages/tsuki/README.md)
- [Tsuki v2 组件文档](docs/components/index.md)
- [Theme v2 指南](docs/components/v2/theme/index.md)
- [项目架构与发布边界](docs/architecture/tsuki-v2-project-framework.md)
- [Playground 源码](apps/playground/)
