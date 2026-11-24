# Batch 16B.3 — Declarative Overlay Primitive 完成报告

## 交付内容

| 文件 | 变更原因 |
| --- | --- |
| `packages/tsuki/src/overlay/overlay-portal.tsx` | 新增私有受控 `OverlayPortal`，把 Portal owner 绑定到当前 Root Registry。 |
| `packages/tsuki/src/__tests__/overlay-portal.test.tsx` | 覆盖隐藏、挂载与更新、退出/重开、失效 ID 回收、Back、Theme 与显式 Context、并行 Entry、StrictMode、owner 卸载和缺失 Root 错误。 |
| `apps/playground/components/interaction-lab/overlay/overlay-declarative-lab.tsx` | 增加使用真实 Portal 的交互 Lab、业务 Context Bridge 和 Registry 诊断面板。 |
| `apps/playground/app/labs/interaction/overlay.tsx` | 在 Overlay Lab 中加入 Declarative 入口。 |
| `apps/playground/__tests__/overlay-host.test.tsx` | 验证 Playground Declarative Lab 连接真实 Root Registry/Host，并验证内容、Context、Theme、多 Portal 与 owner 场景。 |
| `docs/architecture/tsuki-v2-overlay-host-decision.md` | 记录 Portal 的私有边界、Entry 生命周期和 Context/Theme 规则。 |
| `docs/architecture/tsuki-v2-interaction-motion.md` | 记录 16B.3 的架构与 Playground 实现，并链接本报告。 |
| `docs/architecture/tsuki-v2-16b-3-completion-report.md` | 记录变更、验证结果和范围边界。 |

未新增 public export、package export、依赖或 changeset，未修改 package root API。

## 实际内部 API

```tsx
<OverlayPortal
  visible={visible}
  backBehavior="dismiss"
  onBack={handleClose}
  transition={transition}
  mask={<OverlayMask />}
>
  <OverlayContent />
</OverlayPortal>
```

`visible` 与 `backBehavior` 为必填属性；`onBack`、`transition`、`mask` 和 `children` 可选。原语只控制受控 Portal Entry，不负责业务 open state、遮罩样式、内容布局、Safe Area 或 Keyboard。实现位于 `src/overlay/`，没有从组件目录或 package root 导出。

## 所有权、退出和 Context

- Portal 在 layout effect 的 commit 阶段读取当前 `OverlayRuntimeContext`，首次显示时只创建一个 Entry；后续内容、Mask、Transition、Back 和可见状态变化更新同一 ID。
- 隐藏会把 Entry 推进 `exiting`，Host 保留当前内容，等待现有 Mask / Content Transition 完成后由 Registry 移除。退出期间重开保留 ID/key 并推进 generation，过期的退出完成回调不会删除重开的 Entry。
- 若 Registry 已完成退出并移除了 Entry，而 Portal owner 仍挂载，下一次显示会检测失效 ID 并创建新 Entry。真正卸载 owner 会清理其 Entry；清理是幂等的。
- 本地生命周期 lease 将真实卸载清理延迟到一个 microtask。StrictMode 的同步 effect cleanup/setup replay 会重新取得原 Entry，不会短暂留下孤儿或重复创建；真实卸载没有后续 setup，因此会释放所有权。
- Theme 沿用现有 Theme Scope / Overlay Theme Bridge，支持 Root 和嵌套 Provider 的主题继承与更新。业务 React Context 通过 owner 把相应 Provider 显式放进 Portal children；不提供任意 Context 自动桥接。
- Back 复用 Host 级统一分发。`dismiss` 通过 `onBack` 请求 owner 更新 `visible=false`；Portal 不单独注册 BackHandler。

## 自动化验证

以下命令均在工作区根目录运行，退出码均为 `0`：

| 命令 | 结果 |
| --- | --- |
| `pnpm run package:typecheck` | 通过。 |
| `pnpm run package:test:v2` | 17 suites、151 tests 通过。 |
| `pnpm run playground:typecheck` | 通过。 |
| `pnpm run playground:test` | 10 suites、32 tests 通过。输出包含 Reanimated 对归档 v1 FloatingPanel 测试的 native hook 警告，测试仍全部通过。 |
| `pnpm run lint` | 通过。 |
| `pnpm run build` | 通过；Bob 输出 `esm option is disabled` 与 package `require` export 的配置警告。 |
| `pnpm exec prettier --check apps/playground/__tests__/overlay-host.test.tsx apps/playground/app/labs/interaction/overlay.tsx apps/playground/components/interaction-lab/overlay/overlay-declarative-lab.tsx packages/tsuki/src/__tests__/overlay-portal.test.tsx packages/tsuki/src/overlay/overlay-portal.tsx docs/architecture/tsuki-v2-interaction-motion.md docs/architecture/tsuki-v2-overlay-host-decision.md`<br>`pnpm exec prettier --check docs/architecture/tsuki-v2-16b-3-completion-report.md` | 两次命令的目标文件均格式通过，退出码均为 `0`。 |
| `git diff --check` | 通过。 |

## Android Development Client 验收

使用现有 `com.ftsukic.example` Development Client 和 Metro JS bundle 验收，未重建原生应用。观察到：

- 显示时创建单个 Registry Entry 并进入 `entered`；关闭后等待退出完成并移除。快速关闭/重开保留同一 Entry ID，generation 前进，旧退出回调失效。
- 内容 revision 从 0 更新到 1；主题主色从 `#2563eb` 更新为 `#e11d48`；业务 Context 从 A 更新为 B；Mask 开关和 `scale-fade` / `slide-up` 配置可在 Portal 显示期间更新。
- 第二个 Portal 加入后 Registry 数量为 2，关闭该 Portal 后返回 1。Nested Provider Portal 的关闭按钮只卸载其 owner；最新代码的干净重载验收从 ID 1 / count 1 回到 count 0。
- StrictMode Portal 显示为 ID 4 / count 1，关闭后回到 count 0；没有观察到 effect replay 创建重复 Entry。
- Android Back（Agent Device in-app Back）通过受控 `onBack` 关闭 Portal 并将 count 返回 0。Mask 外侧点击也关闭 Portal 并移除 Entry。
- Mask 关闭时，点击遮罩层外的 `Back to Interaction Lab` 控件成功导航，表明无遮罩时页面触摸可穿过 Host。Portal 显示时离开所属 Lab 页面后，重新进入时 Registry count 为 0；Host count 保持 1。

iOS 真机和 HarmonyOS 设备未在本批次验收，按任务范围单独保留。

## Git 状态与未实现项

工作区位于 `tsuki-1x-refactor`，基线 HEAD 为 `1f0da3e`。本报告和上表中的 7 个实现/测试/架构文件构成当前未提交变更；未提交、推送或发布。`fixtures:generate` 没有引入额外变更。

本批次没有实现 public Portal、Dialog / Popup / Toast、任意业务 Context 自动桥接、Safe Area 或 Keyboard 行为；这些仍由后续具体组件决定。Batch 16B.3 到此结束，不自动进入 16B.4。
