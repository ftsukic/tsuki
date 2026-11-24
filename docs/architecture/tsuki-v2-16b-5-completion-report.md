# Batch 16B.5 — Accessibility Runtime 验收报告

## 状态

**Batch 16B.5 — Pending Android TalkBack validation。** Accessibility Runtime、Playground Lab 和自动化覆盖已实现；Android 模拟器已启用真实 TalkBack，并验证了初始焦点请求和嵌套 modal 的 Back 焦点恢复。Windows 自动化路径未能可靠证明 TalkBack 线性滑动导航不会到达底层页面，也未能确认模态内按钮可由 TalkBack 双击激活。因此本批次不标记 Completed。

验收日期：2026-11-23。只验收 Android；iOS 与 HarmonyOS 跳过。

## 实施内容

- 增加私有 `modal | non-modal` Entry 语义，默认 `non-modal`。Declarative Portal 与 Imperative Controller 使用相同 Registry 配置路径。
- 根 `TsukiProvider` 的页面子树由独立 Accessibility boundary 包装，`OverlayHost` 保持为同级节点。最高层有效 modal 确定隔离边界；退出中的 Entry 在完成卸载前继续隔离。更高层 non-modal Entry 可保持访问；没有 modal 时页面不被隔离。
- Focus Runtime 等待目标布局和屏幕阅读器状态，按 Entry ID / generation 校验后发送 `AccessibilityInfo.sendAccessibilityEvent(..., 'focus')`。关闭 modal 后优先恢复下层 modal 的有效目标，否则恢复到 owner 提供的返回焦点 ref；过期请求、无效 ref、Root 卸载会取消调度。
- 增加 Interaction Lab → Overlay → Accessibility 实验台，显示实际 Registry 数、模态边界、配置目标是否挂载和 Entry phase。
- 未新增 public export、依赖、lockfile 或 Native Module；未引入 Dialog、Popup、Toast API。

## 修改范围

| 文件 | 内容 |
| --- | --- |
| `packages/tsuki/src/overlay/accessibility/isolation.ts` | 根据 Registry Entry 层级选择最高有效 modal。 |
| `packages/tsuki/src/overlay/accessibility/overlay-accessibility-boundary.tsx` | 隔离 Root 页面子树并保留 Host 同级挂载。 |
| `packages/tsuki/src/overlay/accessibility/use-overlay-accessibility-focus.ts` | 屏幕阅读器焦点进入、恢复、布局就绪及 generation 取消。 |
| `packages/tsuki/src/overlay/types.ts`、`registry.ts`、`overlay-host.tsx` | Entry Accessibility 配置、更新与每层原生语义。 |
| `packages/tsuki/src/theme/tsuki-provider.tsx`、`overlay/controller.ts`、`overlay/overlay-portal.tsx` | Root boundary 接线，以及 Portal / Controller 的配置传递。 |
| `packages/tsuki/src/__tests__/overlay-accessibility.test.tsx` | modal 边界、层级、焦点请求/恢复、取消和 Root 隔离测试。 |
| `apps/playground/components/interaction-lab/overlay/overlay-accessibility-lab.tsx`、`apps/playground/app/labs/interaction/overlay.tsx` | Accessibility Lab 和入口。 |
| `apps/playground/__tests__/overlay-host.test.tsx` | 验证 Root boundary、Portal 与 Controller 的真实 Registry 集成。 |
| `docs/architecture/tsuki-v2-overlay-host-decision.md`、`docs/architecture/tsuki-v2-interaction-motion.md` | 记录 Accessibility 边界、Focus Runtime、批次状态和本报告链接。 |

## agent-device 与 Android 环境

- 根因是 PowerShell 启动方式不同：`login:false` 未加载 fnm profile；登录 PowerShell 会初始化 fnm，并解析当前 Node.js `v26.13.0`、`npm.cmd` 和现有 `agent-device.ps1`。
- `npm root -g` 下已有 `agent-device/bin/agent-device.mjs`，`npm prefix -g` 下已有 `agent-device.cmd`。通过当前 Node.js 绝对路径执行入口，以及 `agent-device --help` 均成功。未修改持久或系统 PATH，未重新安装/升级 CLI，也未修改全局 Node.js 版本。
- 首选模拟器 `Pixel_10`：Android SDK x86_64，API 37 / Android 17，ADB serial `emulator-5554`。现有 `com.ftsukic.example` Development Client 已安装；复用该 APK，没有清除原模拟器数据或重建原生客户端。
- 原 AOSP 镜像没有 TalkBack。为真实 TalkBack 验收，复用本机已存在的 Google Play API 37 系统镜像创建用户级 `Pixel_10_TalkBack` AVD：设备 model `sdk_gphone16k_x86_64`，API 37，ADB serial `emulator-5556`。从已有模拟器复制已安装 Development Client APK 到该 AVD，没有安装项目依赖或全局 CLI。
- TalkBack 服务 `com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService` 已启用并绑定；`accessibility_enabled=1`、`touch_exploration_enabled=1`。两个模拟器均配置 `adb reverse tcp:18761 tcp:18761`。
- Metro 固定端口 `18761` 正在监听；`Test-NetConnection 127.0.0.1 -Port 18761` 成功。应用通过 `http://10.0.2.2:18761` 加载并进入 `Interaction Lab → Overlay → Accessibility`。

## Android TalkBack 实际观察

| 场景 | 结果 |
| --- | --- |
| 开启 TalkBack 和运行实验台 | TalkBack 系统服务已启用；Playground Accessibility Lab 正常显示。 |
| Modal 初始焦点 | 打开 declarative modal 后，Registry 为 1、当前 modal ID 为 1、页面隔离显示 active；TalkBack 绿色焦点框落在 `Initial focus target layer 1`。通过 Android Back 关闭时焦点返回触发元素。 |
| 嵌套 Modal 与 Back | 同时打开两层后 Registry 为 2；第一次 Android Back 只移除顶层，Registry 回到 1 且焦点回到下层初始目标；第二次 Back 后 Registry 为 0、隔离 inactive，焦点返回页面触发元素。 |
| Non-modal | 切换 `Mode: non-modal` 后打开 Portal，诊断显示 Current modal ID 为 none、Page isolation inactive；本轮通过模拟器窗口单指右滑观察到 TalkBack 焦点框依次经过页面标签和浮层控件。未确认焦点是否到达 `Page action behind the overlay`，因此底层可访问性对照仍未完整通过。 |
| 单指滑动导航与底层隔离 | 初始焦点可见；一次 agent-device 单指右滑后，可见焦点框移到 `Close modal`。随后连续右滑与左滑中，焦点框留在该 modal 控件，没有观察到它移到 `Page action behind the overlay`。但自动化 helper 未能形成可重复的线性焦点顺序；agent-device snapshot 仍列出页面 action 节点，而 snapshot 本身不能代表 TalkBack 的可访问焦点序列。**不能据此判定底层页面不可通过滑动访问，结果 Pending。** |
| Modal 控件朗读和双击激活 | TalkBack 日志可见其 Speech Controller 请求辅助语音音频焦点，但 Windows `agent-device audio probe` 不支持主机音频采集，未直接听辨朗读。`agent-device click --double-tap` 只稳定聚焦到控件，未形成可靠激活；重复触控会被 app 当作两个独立操作。**Modal 内按钮的 TalkBack 双击激活未验证，结果 Pending。** |
| 最终清理 | 关闭两层 modal 后 Registry entries 为 0，Current modal ID 为 none，Page isolation inactive。 |

因此已确认的是 TalkBack 启用、焦点请求、嵌套 Back 恢复及最终回收；未确认的是 TalkBack 线性滑动的隔离边界与模态内按钮的屏幕阅读器激活。无需根据自动化树快照推断设备行为。

## 自动化验证

最终实际通过的命令：

| 命令 | 结果 |
| --- | --- |
| `pnpm run package:typecheck` | 通过。 |
| `pnpm run package:test:v2` | 19 suites、163 tests 通过。 |
| `pnpm run playground:typecheck` | 通过。 |
| `pnpm run playground:test` | 10 suites、35 tests 通过；归档 v1 FloatingPanel 测试输出 Reanimated native-hook 提示，不影响退出码。 |
| `pnpm run lint` | 通过。 |
| `pnpm run build` | 通过；Bob 提示 `esm` 选项关闭但 package 设置了 `exports['.'].require`，未阻断构建。 |
| `pnpm --filter @ftsukic/tsuki exec jest --config jest.v2.config.cjs --runInBand --runTestsByPath src/__tests__/overlay-accessibility.test.tsx` | 1 suite、6 tests 通过。 |
| `pnpm --filter playground exec jest --config jest.config.cjs --runInBand --runTestsByPath __tests__/overlay-host.test.tsx` | 1 suite、9 tests 通过。 |
| `pnpm exec prettier --check`（本批次相关 TS / TSX 与架构 Markdown） | 所有目标文件格式通过。 |
| `git diff --check` | 通过。 |

完整 Playground 测试首次发现 same-Root owner 卸载测试在退出动画尚未完成时立即断言 Registry 数量。测试改为等待退出回收后再断言，目标聚焦测试及完整 10-suite 测试均通过。lint 首次运行也发现本批新增组件和测试的 unused import、ref 与变量命名问题，均已修正；最终全仓 lint 通过。这里修正的是等待条件与 lint，不是运行时缺陷。

## Git 状态与剩余风险

- 分支仍为 `tsuki-1x-refactor`。Batch 16B.3、16B.4 的已有 dirty changes 保留；本批次工作和报告未提交、推送或发布。
- **Batch 16B.5 保持 Pending Android TalkBack validation。** 要解除 Pending，需在 TalkBack 实际开启时重复确认：modal 线性滑动不会进入底层页面；模态内按钮可朗读并可由 TalkBack 双击激活；嵌套 modal 仍按层恢复焦点。当前 Windows 输入 helper 和音频探针不能提供足够确定的证据。
- iOS、HarmonyOS、实体 Android 设备和帧级动画性能未验证。本轮没有开展 Batch 16B.6、Accessibility 之外的 Dialog、Popup、Toast 实现。

## Batch 16B.5.1 — Android TalkBack 收尾跟进

验收日期：2026-11-23。设备为本机 AVD `Pixel_10_TalkBack`，ADB serial `emulator-5556`，设备报告型号 `sdk_gphone16k_x86_64`，API 37。TalkBack 服务仍为 `com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService`，`touch_exploration_enabled=1`；TalkBack 设置中的 `Single-tap to activate` 为关闭状态，因此常规双击激活方式保持启用。没有改动系统 PATH、Node.js 版本或 TalkBack 设置。

复用了已安装的 `com.ftsukic.example` Development Client 和 Metro `18761`。ADB 列表确认 `emulator-5556` 为 `device`，包路径存在，`Test-NetConnection 127.0.0.1 -Port 18761` 成功。Windows 登录 PowerShell 的 agent-device CLI 已可用；本轮没有重新安装、升级或修复全局 CLI。

仅在 `overlay-accessibility-lab.tsx` 增加可见计数：底层 `Page action behind the overlay` 按钮有明确 label 和 `button` role，激活时递增 `Background activation count`；Modal 内 `Modal activation test button` 同样声明 label 和 role，激活时递增 `Modal activation count`。两个计数显示在页面及诊断面板中。原有初始焦点、嵌套 Modal、Back 和生命周期入口均保留。

| 场景 | 本轮结果 |
| --- | --- |
| TalkBack 线性导航 | 使用模拟器窗口的真实单指水平拖动，并观察 TalkBack 绿色焦点框；Non-modal 下焦点框可以从 Accessibility 标签前进到后续页面标签及浮层控件，确认输入被 TalkBack 导航处理。当前可见焦点序列没有到达底层 Page action，未完成双向完整遍历。此前 Modal 操作中观察到焦点框留在浮层控件，未见 `Page action behind the overlay`；但没有留存可复核的完整左右序列，所以 **Modal 隔离与 Non-modal 背景可访问性仍 Pending**。 |
| 嵌套层焦点恢复与回收 | 复用此前记录的真实 TalkBack 绿色焦点框观察：关闭第二层后焦点返回第一层初始目标，关闭最后一层后焦点回到页面触发项；Registry 从 2→1→0。Runtime 未修改，相关聚焦测试本轮通过。 |
| Modal 按钮双击激活 | 当前计数器在操作前后均为 `Modal activation count: 0`。此前 `agent-device click --double-tap` 让计数从 0 变为 2，表明该 helper 分发了两次应用激活，不能作为 TalkBack 双击证据；Windows CUA 鼠标点击也没有稳定地形成 TalkBack 双击。本轮没有把普通鼠标双击、ADB 直接 tap 或直接 `onPress` 计为通过。**TalkBack 双击恰好 +1 未验证。** |
| 底层按钮激活 | 当前可见 `Background activation count: 0`。Modal 关闭后通过 TalkBack 双击底层按钮并观察恰好递增一次的场景未完成。 |
| 朗读 | TalkBack 已启用，但没有取得可听辨的主机音频或带系统音频的录屏。Windows 上 `agent-device audio` 返回 `unsupported-device-backend`（audio probe capture requires a macOS host）；Android `agent-device record` 产出的 MP4 只含画面。**未把 Accessibility label 或屏幕文字当成朗读证据。** |
| 证据文件 | 先前录制的临时屏幕视频位于 `C:\Users\ftsukic\AppData\Local\Temp\tsuki-16b5-1-talkback-focus.mp4`、`tsuki-16b5-2-focus-activation.mp4`、`tsuki-16b5-3-talkback-gesture.mp4` 和 `tsuki-16b5-4-double-tap-try.mp4`；均不含系统音频，且双击尝试视频记录的是不合格 helper 操作。当前界面截图：`C:\Users\ftsukic\AppData\Local\Temp\agent-device-screenshot-XIMBjQ\screenshot.png`，显示 Accessibility Lab、Non-modal 诊断、Entry 计数和两个计数器为 0。 |

最终关闭 Portal 后的设备截图：`C:\Users\ftsukic\AppData\Local\Temp\tsuki-16b5-1-current-lab.png`；截图显示 Registry entries 0、Page isolation inactive、计数器均为 0，TalkBack 焦点框回到页面控件。

**结论：Batch 16B.5.1 未达到 Completed 判据，Batch 16B.5 保持 Pending Android TalkBack validation。** 仍需由实际 TalkBack 双击验证 Modal 与背景按钮分别恰好递增 1，并确认 Modal 中控件的实际朗读；还需保存完整左右焦点遍历证据，包含 Modal 不暴露背景、第二层不暴露第一层、关闭后焦点恢复，以及 Non-modal 可访问背景的对照。此结论不是基于 UIAutomator 树推断。

本轮实际重跑的检查：Playground `typecheck` 通过；`overlay-host.test.tsx` 1 suite / 9 tests 通过；目标 Lab 文件 ESLint 通过；Lab 和本报告 Prettier 检查通过；`git diff --check` 通过。未重跑 package suites，因为 Runtime 没有修改。

Git 仍在 `tsuki-1x-refactor`；此前 Batch 16B.3、16B.4、16B.5 的 dirty changes 保留，新增的 Lab 和报告改动也未提交、推送或发布。没有开始 Batch 16B.6 或其他 Overlay 功能实现。
