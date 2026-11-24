# Batch 16B.4 — Imperative Overlay Controller 实施与验收报告

## 状态

**Batch 16B.4 — Completed。** Android 模拟器验收已完成，计划要求的 Imperative Controller 场景通过。本批次没有提交、推送或发布。

验收日期：2026-11-23。只验收 Android；iOS 与 HarmonyOS 按计划跳过。

## 实施内容

- 新增私有 `packages/tsuki/src/overlay/controller.ts` 与 `useOverlayController.ts`。Hook 默认绑定调用位置的 Root Registry、`ResolvedTheme` 和 Theme scope；显式 `useOverlayController('root')` 绑定所属 Root 的最新根主题。
- 每次 `open()` 创建独立 Entry，并返回稳定的 `{ id, update(), close() }` Handle。`update()` 保持 Entry ID、React key 和层级顺序；退出中的 Entry 不会因更新而复活。
- 首次 `close()` 通过现有 Registry 进入 `exiting`，复用 Mask / Content Transition、Back 和 generation 生命周期。重复 close 返回 `false`。Hook owner 卸载后，旧 Controller 与 Handle 失效；尚在活动的 Entry 进入正常退出。
- Imperative Playground Lab 覆盖 current/root Theme、多层 Entry、Mask、Timing / Spring、快速关闭、Declarative + Imperative 混合、Back、owner 清理与运行时诊断。
- Android 操作发现居中的卡片会遮住底层实验按钮。卡片已移至实验台顶部，并增加卡片内 Update 操作，使默认 Mask 开启时仍能验证内容更新。增加第二个独立 Controller owner 控件，以验证同一 Root 的 owner 隔离。
- 未新增公共 export、package export、依赖或额外 React Root；没有重构 Overlay Runtime。

## 修改文件

| 文件 | 内容 |
| --- | --- |
| `packages/tsuki/src/overlay/controller.ts` | 私有 Controller / Handle、Entry 所有权与失效处理。 |
| `packages/tsuki/src/overlay/useOverlayController.ts` | Root 绑定、current/root Theme scope 和 StrictMode-safe owner 生命周期。 |
| `packages/tsuki/src/__tests__/overlay-controller.test.tsx` | 6 项 Controller 聚焦测试，包含双 Root、Theme、ID / 顺序、退出、Back、StrictMode、owner 卸载与旧 Handle。 |
| `apps/playground/components/interaction-lab/overlay/overlay-imperative-lab.tsx` | Imperative Lab、诊断面板与独立第二 Controller owner 验收入口。 |
| `apps/playground/__tests__/overlay-host.test.tsx` | Imperative Lab 集成覆盖，包括同 Root 的第二 owner 隔离。保留了原有 Batch 16B.3 dirty changes。 |
| `apps/playground/app/labs/interaction/overlay.tsx` | Overlay 实验台 Imperative 入口。 |
| `packages/tsuki/src/overlay/overlay-portal.tsx` | Batch 16B.3 私有 Declarative Portal。 |
| `packages/tsuki/src/__tests__/overlay-portal.test.tsx` | Batch 16B.3 Portal 回归覆盖。 |
| `docs/architecture/tsuki-v2-overlay-host-decision.md` | 记录 Controller、Root Theme、Handle、退出及 owner 清理规则。 |
| `docs/architecture/tsuki-v2-interaction-motion.md` | 更新实现状态与 16B.4 边界，并链接本报告。 |
| `docs/architecture/tsuki-v2-16b-3-completion-report.md` | Batch 16B.3 完成报告，保留原有工作区变更。 |

Hook 使用项目 Rule 要求的 camelCase 文件名 `useOverlayController.ts`。

## agent-device 与 Android 环境

- PowerShell `login:false` 跳过了 fnm profile，因此解析不到 `node.exe`、`npm.cmd` 和 `agent-device`。登录后的 PowerShell profile 选择已有 fnm Node.js `v26.13.0`，并能解析现有全局安装的 `agent-device`。
- 已通过 `agent-device --help`，并以当前 Node.js 绝对路径运行全局入口 `agent-device/bin/agent-device.mjs --help`。确认 npm 全局入口与 shim 均存在。未重新安装 CLI、未升级 CLI、未修改系统或持久 PATH，也未切换全局 Node.js 版本。
- 设备：`Pixel_10` AVD，Android SDK emulator x86_64，Android 17 / API 37，ADB serial `emulator-5554`。
- `com.ftsukic.example` Development Client 已安装，`pm path` 返回现存 APK。复用了已有安装，没有清除应用数据或重新构建原生客户端。
- Metro 固定端口 `18761` 正在监听，`Test-NetConnection 127.0.0.1 -Port 18761` 成功；ADB reverse 为 `host-15 tcp:18761 tcp:18761`。
- 已打开应用并进入 `Interaction Lab → Overlay → Imperative`。

## Android 实机验收

| 场景 | 实际结果 |
| --- | --- |
| Open / Update / ID 稳定 | 打开 Entry 后卡片显示 `Content revision: 0`。卡片内连续 Update 后显示 revision 2，Registry Entry ID 保持不变；再次更新 newest 也只改变内容，不改变 Entry 层级。 |
| Close 与回收 | Timing、Spring 退出均完成；卡片关闭后 `Owned handles: 0`、Entry IDs 为 `—`、Registry Entry Count 为 `0`。 |
| 重复 Close | 退出期间快速连续点 `Close newest` / `Close newest again`，第二次状态为 `Close returned false`；Entry 随退出完成回收。 |
| 退出期间 Update | 正常退出期间 Update 返回 `true`，Entry 仍保持退出并最终回收，没有重新打开。Controller owner 已卸载后，旧 Handle 的 Update 与 Close 均返回 `false`。 |
| Current / Root Theme | Current-bound Entry 随嵌套 Theme 从 `#2563eb` 更新为 `#e11d48`。Root-bound Entry 使用 Root Theme `#055FFD`；Root 切为 dark 后更新为 `#4D8DFF`。更新 Theme 没有创建重复 Entry。 |
| 多 Entry 与层级 | 同时存在 Entry 2、3、4；更新顶部 Entry 后顺序仍为 2、3、4。关闭顶部 Entry 4 后，Entry 2、3 状态保留。 |
| Declarative 混合 | 两个 Imperative Entry 与 Declarative Portal 共存，Registry 数量为 3；隐藏 Portal 后 Imperative Entry 仍保留，数量回到 2。 |
| Timing / Spring | Timing 与 Spring 的进入、退出均在 Android 上观察到；两种动画完成后没有孤儿 Entry。 |
| Enter 中关闭 | `Open + close during enter` 返回 `true`；动画结束后 Entry IDs 为空且 Registry 数量为 0。 |
| Mask | 默认 Mask 开启时显示实际 Mask 层，内容卡片可关闭 Entry。关闭 Mask 后诊断显示 `off`，新 Entry 不挂载 Mask 层；Spring Content-only 退出完成并归零。 |
| Android Back | 两个 Entry 存在时，第一次系统 Back 只关闭顶部 Entry，底层 Entry 仍为 `entered`；第二次关闭最后一个 Entry 并归零；第三次 Back 恢复页面返回行为，回到 Interaction Lab。 |
| Owner 卸载与同 Root 隔离 | Primary owner Entry 进入 `exiting`；卸载后旧 Handle Update / Close 为 `false`，旧 Controller Open 显示 `Cannot open an Overlay entry from an unmounted useOverlayController owner.`。同 Root 第二 Controller owner 的 Entry 保持 `entered`、Registry 数量为 1；关闭它后归零。重新挂载 Primary owner 后可正常 Open / Close。 |
| 最终清理 | 最终 `Owned handles: 0`、Entry IDs 为 `—`、Registry Entry Count 为 `0`、Host Count 为 `1`。 |

以上为 Android 模拟器真实交互结果；不代表帧级性能测试或其他 Android 设备表现。

## 自动化验证

Batch 16B.4 设备验收前已实际通过：

| 命令 | 结果 |
| --- | --- |
| `pnpm run package:typecheck` | 通过。 |
| `pnpm run package:test:v2` | 18 suites、157 tests 通过。 |
| `pnpm run playground:typecheck` | 通过。 |
| `pnpm run playground:test` | 10 suites、33 tests 通过；输出含归档 v1 FloatingPanel 的 Reanimated 原生 Hook 提示，不影响退出码。 |
| `pnpm run lint` | 通过。 |
| `pnpm run build` | 通过；Bob 的 `esm` / `require` 配置提示未阻断构建。 |
| 目标 Markdown / TS / TSX 的 Prettier 与 `git diff --check` | 通过。 |

本轮实验台修正后重新运行：

| 命令 | 结果 |
| --- | --- |
| `pnpm --filter playground exec jest --config jest.config.cjs --runInBand --silent __tests__/overlay-host.test.tsx` | 1 suite、8 tests 通过。 |
| `pnpm run playground:typecheck` | 通过。 |
| `pnpm exec eslint apps/playground/components/interaction-lab/overlay/overlay-imperative-lab.tsx apps/playground/__tests__/overlay-host.test.tsx` | 通过。 |
| 目标文件 `pnpm exec prettier --check` | 通过。 |
| `git diff --check` | 通过。 |

未在本轮重复无关的 package 全量测试、构建或 CI。自动化测试与静态检查不替代上面的 Android 真实交互验收。

## Git 状态与剩余风险

- 分支仍为 `tsuki-1x-refactor`。Batch 16B.3 / 16B.4 的所有既有 dirty changes 均保留，本轮没有提交、推送或发布。
- 当前目标变更没有未通过的 Android 必要场景；**Batch 16B.4 标记为 Completed**。
- iOS 与 HarmonyOS 未验证，按本批次范围跳过；Android 只在 API 37 x86_64 模拟器验收，尚无实体设备或帧级性能结果。
- Batch 16B.5 Accessibility、Dialog、Popup 和 Toast 尚未开始；进入下一批次前仍需按该批次范围安排平台验证。
