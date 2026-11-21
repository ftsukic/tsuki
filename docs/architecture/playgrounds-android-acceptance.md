# Playground 命名与并行调试验收

日期：2026-11-21。工作区：Windows `react-native-ui-win`，`D:\dev\code\tsuki`；分支 `tsuki-1x-refactor`。设备：已连接的 `emulator-5554`（Pixel_10，x86_64）。未创建 Git 提交。

## 文件与范围

| 修改 | 原因 |
| --- | --- |
| `apps/playground-nw4/`、`apps/playground-nw5/` | 使用 `git mv` 迁移两个 NW 项目，package name 与新目录一致；图标文件仅移动，内容不变。 |
| 三个应用的 `package.json`、`app.json` | 设置独立启动端口与开发客户端模式；显示名称为 Tsuki、NW4、NW5。主应用保留 Fixture 生成前置步骤。 |
| 两个 NW 应用的 `App.tsx` | ConsumerDemo 标题分别为 NW4、NW5；保留共享 Fixture 与主题桥接。 |
| `apps/playground-nw4/babel.config.js` | 为原 NativeWind preset 中的 JSX 插件明确解析路径，修复 pnpm 隔离布局下实际出现的 MODULE_NOT_FOUND；未更换 preset 或插件版本。 |
| 根 `package.json` | 提供两个统一命令，更新 workspace filter、lint 路径，并将新脚本测试接入现有 `test` 命令；保留旧 consumer 命令别名。 |
| `scripts/playgrounds.cjs` | 端口预检、单项目 Expo 非交互启动、ADB reverse、顺序安装、APK 本地复用和错误定位。并行执行仍由 pnpm 原生能力承担。 |
| `scripts/playgrounds.test.cjs` | 覆盖三个固定端口冲突、非法模拟器参数，以及原生输入缓存失效与 JS 页面不失效。 |
| `scripts/test-consumer-tarballs.cjs` | 更新两个临时验证项目来源与 v4 判断使用的新名称。 |
| `pnpm-lock.yaml` | 只改两个 workspace importer 路径；依赖 specifier、版本、resolution 均未变。 |
| `README.md`、`docs/index.md`、`packages/tsuki/README.md` | 更新开发命令、目录链接与使用说明。 |
| `docs/architecture/tsuki-batch-10-audit.md`、`tsuki-v2-project-framework.md`、`tsuki-v2-interaction-motion.md`、`docs/components/v2/theme/index.md` | 更新旧目录引用。已有 interaction/motion 文档中的其他未提交内容保留。 |
| 已忽略的三个 `android/` 原生目录 | 同步 `strings.xml` 的 `app_name` 与 `settings.gradle` 的 `rootProject.name`；NW5 原生目录由 Expo 生成。这些目录未加入 Git。 |

未更改 `packages/tsuki` 实现、NativeWind 版本、applicationId、bundleIdentifier、scheme、slug 或图标内容。没有新增第三方依赖。`pnpm-workspace.yaml` 原有 `apps/*` 已覆盖新目录，无需修改。

执行前保存了已有 dirty/untracked 文件的内容哈希。最终核对 36 个文件逐字节保留；另 1 个原本已修改的架构文档只额外替换了两个项目旧路径，原有内容未被覆盖。`git mv` 产生的重命名位于 index，后续内容修改保持未提交状态。

## 端口与命令

| 应用  | 目录 / package name                      | Metro | Android applicationId           |
| ----- | ---------------------------------------- | ----- | ------------------------------- |
| Tsuki | `apps/playground` / `playground`         | 18761 | `com.ftsukic.example`           |
| NW4   | `apps/playground-nw4` / `playground-nw4` | 18762 | `com.ftsukic.tsukinativewindv4` |
| NW5   | `apps/playground-nw5` / `playground-nw5` | 18763 | `com.ftsukic.tsukinativewindv5` |

```bash
pnpm playgrounds:install:android
pnpm playgrounds:dev
# 多模拟器时指定 ADB serial：
pnpm playgrounds:install:android --device emulator-5554
```

每个 `start` 都向 Expo 显式传入 `start --dev-client --port <固定端口>`。单项目启动与统一启动均检查端口；统一启动先检查全部三个端口，再通过 `pnpm --parallel --stream` 执行。日志使用 pnpm 的项目路径前缀。启动不安装应用、不启动模拟器，只为已连接的模拟器恢复 ADB reverse。

Expo 输出通过管道传递，使端口切换提示无法交互确认；没有设置会关闭 Metro watch 的 `CI=true`。本机代理环境下曾出现 Expo 联网请求等待，默认使用 `EXPO_OFFLINE=1` 后 HTTP 和应用连接正常；需要联网时可显式设置 `EXPO_OFFLINE=0`。

Expo SDK 57 的 `--port` 与 `--no-bundler` 互斥。安装流程使用 `expo run:android --no-bundler --no-install`，随后为该应用显式打开对应固定端口的开发客户端链接。Expo 此时可能仍打印默认 8081 的 headless 地址，这不代表启动了 8081 Metro；已检查安装前后没有 8081 或三个固定端口的监听服务。

本地缓存位于各应用已忽略的 `.expo/playgrounds-android.json`。缓存记录原生配置、应用 package manifest、lockfile、插件、资源、原生源文件、设备 ABI 和 APK 内容哈希；命中时传 `--binary`，不执行 Gradle assemble。JS 页面修改不使原生缓存失效。缺失记录、原生输入变化或 APK 变化时重新构建。手工修改 node_modules 中的原生依赖后应删除相应缓存记录以强制构建。

## 实际验收

| 检查 | 结果 |
| --- | --- |
| 实施前目标端口 | 18761、18762、18763 均无监听进程。 |
| `pnpm playgrounds:install:android` | Tsuki → NW4 → NW5 顺序构建安装成功，均在同一模拟器。失败时停止的行为在最初的 Expo 参数失败中也实际观察到。 |
| 指定设备安装 | `--device emulator-5554` 完整执行成功。没有启动 Metro。 |
| 再次安装 | 三个项目均输出 `Native inputs unchanged; reusing APK without a build`；没有执行 Gradle 构建，退出码 0。 |
| `pnpm playgrounds:dev` | 三个 Metro 同时运行；各自 `/status` 返回 200、`packager-status:running`，响应的项目根路径分别正确。 |
| 连接隔离 | 三个应用分别从 18761、18762、18763 加载；NW4、NW5 页面标题正确，Tsuki 组件目录显示 64 个入口。 |
| 桌面名称与切换 | Android 应用抽屉同时显示 Tsuki、NW4、NW5；逐一点击可回到各自页面，NW 应用保留各自主题与计数状态。 |
| Fast Refresh | 三个项目分别临时修改页面标题，实际等待到新文字出现；测试后恢复原文件。NW4 原有开关关闭，验收时在开发菜单启用；NW5 开关也核对为启用。 |
| 主题和功能冒烟 | Tsuki 深浅主题切换、组件目录导航通过；NW4/NW5 的主题切换与 Cell 计数 0 → 1 通过。 |
| Ctrl+C | 多次停止统一命令后，三个固定端口均释放；Windows 出现批处理终止提示时输入 Y。 |
| 端口冲突 | 在服务运行时再次执行统一启动，报告全部三个项目、端口和 `EADDRINUSE`，退出码 1，无端口漂移。自动测试还逐一覆盖三个端口。 |

设备操作中曾发生 ADB server 不响应，重启该 server 后恢复；没有重启模拟器或删除应用数据。原生构建存在 Gradle/CMake/依赖弃用警告，但未阻止构建。

## 静态验证与限制

已运行并通过：

- `pnpm install --offline --frozen-lockfile --ignore-scripts`。
- `node --test scripts/playgrounds.test.cjs`：3 个测试通过。
- 两个 NW 应用的 `pnpm --filter <package> exec tsc --noEmit`。
- 三个应用使用本地已安装 Expo CLI 执行 public config，核对名称、应用标识、scheme 与 slug。
- 对两个 NW 应用和修改脚本执行聚焦 ESLint。
- 对修改的脚本、Babel 配置、package/app JSON 执行 Prettier 检查。
- `pnpm fixtures:check`：64 个入口通过。
- `git diff --check` 与 `git diff --cached --check`。
- 搜索旧项目名：仅剩按要求保留的两个 Expo slug；没有旧目录路径或旧 workspace package filter。

本次为 Android 开发流程与相关功能冒烟验收，没有运行完整 CI、完整 npm tarball 消费验证、全部组件交互回归、iOS 或 HarmonyOS 验收。没有创建提交，等待后续验收。
