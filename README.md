# Tsuki

Tsuki 是一个 React Native UI 组件库。Tsuki v2 是当前主线；完整 v1 源码保存在 `packages/tsuki/bak/src/`，仅用于历史参考和 Legacy Playground。

## 当前工作区

| 路径 | 用途 |
| --- | --- |
| `packages/tsuki/src/` | Tsuki v2 源码和正式公共入口 |
| `packages/tsuki/bak/src/` | 已归档的 v1 完整源码，不参与 v2 构建或 npm 包 |
| `packages/tsuki/dist/` | 由构建生成的 CommonJS、ES Module、TypeScript 声明和 CSS 资源 |
| `apps/playground/` | 正式开发工作台：v2 与 Legacy v1 组件、Theme Playground、Design Tokens |
| `apps/playground-nw4/` | 独立 NativeWind v4 集成验证应用 |
| `apps/playground-nw5/` | 独立 NativeWind v5 集成验证应用 |
| `packages/consumer-fixtures/` | 两套 Consumer 共享的内部验证场景，不发布到 npm |
| `docs/` | v2 组件、Theme、架构和历史 v1 指南 |

Playground 的 Fixture Manifest 当前包含 **64 个目录入口**：9 个 v2 组件入口和 55 个 Legacy v1 入口。9 个 v2 入口对应 73 个 runnable 示例。主题系统有 10 个 Semantic Token 和 Button、Input、Divider、Surface、Card、Cell 六组 Component Token。Manifest 是组件目录的唯一示例来源。

## 开始使用

安装和最小接入步骤见 [npm package README](packages/tsuki/README.md)。完整 API 页面见[组件文档](docs/components/index.md)；主题指南见 [Theme v2](docs/components/v2/theme/index.md)。

## 开发

三个 Android Playground 共用一台已连接的模拟器：

```bash
pnpm playgrounds:install:android
pnpm playgrounds:dev
```

首次安装按 Tsuki → NW4 → NW5 顺序执行，不启动 Metro；后续原生输入与 APK 校验未变化时直接通过 Expo `--binary` 复用 APK，跳过构建；JS 页面修改只需 Fast Refresh。缓存放在各应用已忽略的 `.expo/playgrounds-android.json`，原生配置、依赖锁定、插件、图标资源、ABI 或 APK 变化会触发重新构建，构建时仍保留 Gradle 增量缓存。连接多个模拟器时用 `pnpm playgrounds:install:android --device emulator-5554` 指定 ADB serial。安装不启动模拟器。

| 应用  | 目录 / workspace package                 | Metro |
| ----- | ---------------------------------------- | ----- |
| Tsuki | `apps/playground` / `playground`         | 18761 |
| NW4   | `apps/playground-nw4` / `playground-nw4` | 18762 |
| NW5   | `apps/playground-nw5` / `playground-nw5` | 18763 |

`playgrounds:dev` 在启动前检查全部固定端口，再使用 pnpm 原生并行执行与带项目前缀的实时日志；端口冲突直接失败，不自动更换端口，不安装应用。按 Ctrl+C 停止全部服务（Windows 若出现批处理终止提示，输入 Y）。每个应用也可独立执行 `pnpm --filter <workspace package> start`。启动保持 Metro watch/Fast Refresh，不设置 `CI=true`。默认设置 `EXPO_OFFLINE=1`，避免本机代理下的 Expo 联网检查阻塞本地请求；如需 Expo 联网功能，可在环境中设置 `EXPO_OFFLINE=0`。

安装命令为每个开发客户端打开自己的固定 Metro URL，并配置对应的 ADB reverse。Metro 启动后，在 Android 桌面切换 Tsuki、NW4、NW5；首次连接可在各自开发客户端的历史记录中选取对应 URL。`playgrounds:dev` 会为当前已连接的模拟器恢复三个 ADB reverse 映射，模拟器重启后也无需重新安装。

若开发客户端曾关闭 Fast Refresh，请在其开发菜单中重新启用；启动脚本会保留这个应用级设置。

Expo SDK 57 不允许同时传 `--port` 和 `--no-bundler`，因此安装使用 `expo run:android --no-bundler --no-install`，随后显式打开对应端口的开发客户端链接。应用标识、scheme、slug 和图标保持原值。参考 [Expo CLI](https://docs.expo.dev/more/expo-cli/)。

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
