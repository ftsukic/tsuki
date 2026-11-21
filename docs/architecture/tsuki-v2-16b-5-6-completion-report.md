# Batch 16B.5.6 — Overlay Transition Review Fixes 完成报告

状态：**Completed**。范围限于 Overlay Runtime 内部 Transition 修复、聚焦测试、Playground 验收入口和文档记录。

## 1. 修改文件及原因

| 文件 | 修改原因 |
| --- | --- |
| `packages/tsuki/src/overlay/transition/use-overlay-transition.ts` | 在 UI Worklet 侧以 listener-presence SharedValue 门控 JS 进度调度；保留 10% 档位、`onProgressRef` 和 generation 参数，并支持动态增删 listener。 |
| `packages/tsuki/src/overlay/transition/transition-style.ts` | 增加 `enter` / `exit` 阶段参数，分别读取对应 MotionPreset 定义并按可见进度映射。 |
| `packages/tsuki/src/overlay/transition/overlay-transition.tsx` | 根据 Registry phase 选择当前样式阶段并传递给 Mask 与 Content。 |
| `packages/tsuki/src/__tests__/overlay-transition.test.ts` | 用可控动画回调补充 lifecycle、取消、反转、过期回调及 progress listener 覆盖。 |
| `packages/tsuki/src/__tests__/overlay-transition-style.test.ts` | 新增阶段端点、非对称属性、归一化位移、缺省值和对称 preset 回归测试。 |
| `packages/tsuki/src/motion/presets.ts` | 增加仅供私有 Overlay Lab 使用的非对称验收 preset。该模块不属于 package exports 或根导出。 |
| `packages/tsuki/src/__tests__/motion.test.tsx` | 将私有验收 preset 纳入内部 Motion preset 清单断言。 |
| `apps/playground/components/interaction-lab/overlay/overlay-transition-lab.tsx` | 提供非对称 Enter / Exit 的设备验收选项。 |
| `apps/playground/__tests__/overlay-host.test.tsx` | 覆盖该选项和实际 Host 下的非对称 Transition Lab 路径。 |
| `docs/architecture/tsuki-v2-interaction-motion.md` | 记录本批次实现概述并链接本报告。 |
| `docs/architecture/tsuki-v2-16b-5-6-completion-report.md` | 记录实现、验证、设备验收和 Git 状态。 |

除上述 Overlay / Transition 相关文件外，工作区中 Batch 16B 及更早批次的 dirty 文件均保留，没有覆盖或清理。

## 2. Progress 调度优化前后

修改前，Mask 和 Content reaction 在每个 10% 档位变化时都会调用 `scheduleOnRN`，即使 Entry 没有 `onTransitionProgress` listener。

修改后，reaction 在 UI Worklet 侧检查 listener-presence SharedValue。没有 listener 时不会执行 JS 调度；有 listener 时仍按 10% 档位通知，并携带原 generation。`onProgressRef` 保持稳定，listener 动态增加或移除时同步更新 SharedValue，不以 JS 驱动逐帧动画。Mask 与 Content 使用相同逻辑。

自动化测试确认：无 listener 时两通道均没有 `scheduleOnRN` 调用；增加 listener 后两通道各通知一次并报告正确档位和 generation；移除后不再新增调度或回调。

## 3. Enter / Exit Preset 映射

- Enter 使用 `preset.enter`：可见进度 `0` 为 `enter.from`，`1` 为 `enter.to`。
- Exit 使用 `preset.exit`：可见进度 `1` 为 `exit.from`，`0` 为 `exit.to`。
- `opacity`、`scale`、`translateX`、`translateY` 继续逐属性插值；位移乘以屏幕宽或高。未定义的属性使用 identity 值。
- 原有内置对称 preset 的 Enter / Exit 输出保持一致；没有更改 `MotionPreset` 类型结构。

## 4. 新增测试及覆盖场景

- Timing Mask 与 Spring Content 同时进入；分别完成后才标记 entered，完成只触发一次。
- Exit 两通道独立完成；任一未完成时 Entry 保持挂载，全部完成后卸载。
- Enter → Exit → Enter 反转保持 Entry ID 与 SharedValue；验证旧 Enter / Exit generation 回调不能完成新生命周期。
- 覆盖通道取消、重复完成、Content-only（无 Mask）完成，以及两种通道完成顺序。
- 覆盖无 listener、不调度、运行中新增 listener、移除 listener 后停止调度，并校验进度档位与 generation。
- Style 测试覆盖 Enter / Exit 起终点、不同 opacity / scale / 双轴位移、默认值、屏幕尺寸缩放及全部既有对称 preset。
- Playground 测试覆盖非对称 preset 选择、Reduced Motion、并行层和 Mask None 路径。

## 5. 自动化测试实际结果

以下命令均在本轮实际运行，退出码为 0：

| 命令                            | 结果                       |
| ------------------------------- | -------------------------- |
| `pnpm run package:typecheck`    | 通过                       |
| `pnpm run package:test:v2`      | 16 suites / 143 tests 通过 |
| `pnpm run playground:typecheck` | 通过                       |
| `pnpm run playground:test`      | 10 suites / 31 tests 通过  |
| `pnpm run lint`                 | 通过                       |

Playground Jest 输出一条 Reanimated 提示，来自 `component-screen.test.tsx` 渲染的历史目录 `packages/tsuki/bak/src/motion/useTransitionProgress.ts`；该测试通过，提示不影响命令退出状态。11 个目标 TS / TSX / Markdown 文件的 `pnpm exec prettier --check` 通过；`git diff --check` 通过。

## 6. Android 模拟器验收

设备：Pixel 10 模拟器 `emulator-5554`，Android API 37，1080 × 2424；使用现有 Playground Development Build，通过 Android UI hierarchy、设备点按和屏幕截图核验。首次通过 deep link 启动时遇到一次 Expo dev launcher React context 异常；从 Launcher 重新启动后显示 `Running "main"`，之后的验收场景正常运行，没有持续 JS 错误。

| 场景 | 实际结果 |
| --- | --- |
| Timing 进入与退出 | Entry 到达 `entered`、两路进度 100%；点按关闭后回到 hidden，Host layer 清除。 |
| Spring 进入与退出 | Content Spring / Mask Timing 到达 `entered`；关闭时仍等待两个通道，完成后清除 Entry。 |
| Enter 中途关闭 | 使用 Enter-then-close 操作；进入过程中触发关闭，最终回到 hidden 且没有残留 layer。 |
| Exit 中途重开 | 重新打开沿用原 Entry ID；最终 `entered`，generation 增至 3，未被旧 Exit 回调卸载。 |
| Mask / Content 不同时长 | Timing 配置为 Mask 180 ms、Content 300 ms。Exit 中途 hierarchy 显示两路进度分别为 70% 和 90%，随后按各自完成回收。 |
| 非对称 Enter / Exit | Lab 选择 `overlay-asymmetric-test` 后正常进入；Exit 中间帧可见卡片移动并淡出，phase 为 `exiting`，进度继续降向 0。 |
| Reduced Motion | 开启后 Entry 到达 `entered`、两路进度 100%；关闭后回到 hidden，card 和 Host layer 数量均为 0。 |
| Mask None | Entry 成功进入，Mask 显示 `not mounted`、Content 为 100%；关闭后层数归零。 |
| 并行 Entry | 同时存在 ID 9 和 ID 10 两层；ID 10 完成进入后逐层关闭，Host layer 数量从 2 降至 1 再到 0。 |
| 快速连续开关与最终清理 | Quick sequence 完成后 phase 为 hidden，card 数与 Host layer 数均为 0。 |

## 7. 未完成事项

本批次要求的 Android 模拟器验收和自动化检查均已完成。按任务约束未运行 iOS 或 HarmonyOS 设备验收；本报告不据 Android 结果推断这两个平台行为。没有做帧率或逐帧流畅度测量。

## 8. Git 分支、HEAD 与 dirty worktree

- 分支保持 `tsuki-1x-refactor`。
- HEAD 开始时为 `879b90d4e9cdb6ef3b3ace295b2a6c2de57b61c5`；交付前 Windows Connector 返回的 HEAD 前缀仍为 `879b90d`，与起始 SHA 匹配。
- 最终 Windows Connector Git 状态有 10 个 unstaged tracked 修改、10 个 untracked 条目、0 个 staged 条目、0 个冲突。开始任务时 worktree 已含 Overlay 实现、测试、Lab 和文档等 dirty 内容；这些内容均保留，本批次仅在相关文件补充 Transition 修复及报告。
- 未运行 reset、stash、checkout、rebase；没有修改 `package.json`、lockfile、Changeset、根导出或 package exports，也没有新增依赖。
- 没有提交、推送或发布。
