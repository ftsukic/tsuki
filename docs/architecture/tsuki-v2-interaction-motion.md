# Tsuki v2 Interaction & Motion Architecture

| 项目 | 说明 |
| --- | --- |
| 状态 | Batch 15 — Motion、Pressable、Pan/Swipe 与 Interaction Lab 已实现；Batch 16B Overlay Registry、双通道 Motion Transition、声明式 Portal、Root-bound Imperative Controller 与 Accessibility Runtime 已实现。Batch 16B.5 的 TalkBack 激活和线性导航设备验收仍 Pending；自动化与各平台验收状态见本文末尾。 |
| 基线 | `tsuki-1x-refactor`，`879b90d`。 |
| 范围 | Motion、Pressable、Gesture、Overlay。 |
| 原则 | 先建立统一运行时，再迁移业务组件。 |

本文记录 v2 交互与动效运行时的当前实现、目标边界、依赖方向和分批验收要求。规划部分不代表尚未完成的能力已存在于源码；源码、配置和 CI 是当前实现状态的事实来源。

## 1. 当前基线

下表是两个独立 NativeWind Consumer 当前锁定的工作区版本，不是 Tsuki 对消费者的精确版本要求。包的 peer 范围以 `packages/tsuki/package.json` 为准。

| 依赖            | Consumer 工作区版本         |
| --------------- | --------------------------- |
| React           | 19.2.3                      |
| React Native    | 0.86.3                      |
| Reanimated      | 4.7.1                       |
| Gesture Handler | 2.33.1                      |
| Worklets        | 0.13.1                      |
| NativeWind      | v4 `4.2.7`；v5 `5.0.0-rc.1` |

当前 v2 的实现状态：

| 能力 | 当前源码事实 |
| --- | --- |
| Motion | `packages/tsuki/src/motion/` 提供 MotionValue、Timing/Spring/Decay primitives、统一配置、Reduced Motion、过渡进度和 `MOTION_PRESETS`。Theme policy 位于现有 ThemeConfig / ResolvedTheme。 |
| Pressable | `packages/tsuki/src/pressable/` 是私有 React Native Pressable 适配层。Button 使用 scale 反馈（pressed scale `0.98`）；交互 Cell 使用 semantic surface → border 的 background 反馈。 |
| Gesture | `packages/tsuki/src/gesture/` 提供私有 Pan/Swipe Runtime；Playground Interaction Lab 直接预览该 Runtime。 |
| Theme motion policy | `ThemeConfig` / `ResolvedTheme` 含 `motion` 字段；`serializeTheme()` 不序列化该运行策略。 |
| Gesture root | 当前 v2 `TsukiProvider` 不提供 `GestureHandlerRootView`；Playground 在应用根部提供，其他应用也必须自行提供。 |
| Overlay / Portal | Batch 16A.2 完成架构决策；Batch 16B 已实现每 Root 独立 Registry、稳定 Entry phase/generation、根 `TsukiProvider` 唯一 Host、Theme Bridge、Host 级 Back 适配、双通道 Motion Transition、声明式 Portal 和私有 `useOverlayController()`。命令式调用默认捕获当前 Theme scope；显式 `'root'` scope 可供 Root-bound 服务调用。运行时代码位于 `packages/tsuki/src/overlay/`；具体自动化和原生验收以本文末尾状态为准。View 是三端 Host 基线；iOS `FullWindowOverlay` 仍是可选验证项。`react-native-teleport` 仍是开发依赖而非运行时依赖；v1 归档实现依赖应用提供的 `PortalProvider`，v2 不引入 Teleport 或平台 Portal API。 |

内部模块不会因为目录建立而成为 package API。当前 `packages/tsuki/src/index.ts` 和组件 barrel 中已存在的导出仍是兼容面；后续内部实现不得借机删除或改名。

## 2. 模块与依赖方向

运行时分为四个内部模块：

| 模块 | 职责 |
| --- | --- |
| Motion | 动画执行、配置解析、预设与过渡生命周期。 |
| Pressable | 原生按压事件与视觉反馈之间的适配。 |
| Gesture | 手势识别、UI thread 运动、释放决策与吸附。 |
| Overlay | 通过应用级 Host 和内部 Registry 提供浮层挂载、更新、卸载、层级与宿主适配；具体组件拥有打开和关闭语义。 |

```text
Button / Cell / future Popup / Dialog
                 |
          Pressable / Gesture
                 |
               Motion
                 |
        Reanimated / Worklets

Overlay ── Motion (entry/exit; Mask + Content channels)
   ├────── Gesture (optional interaction)
   ├────── React Native View (Host rendering)
   └────── existing ThemeContext (private bridge)
```

此图描述目标依赖方向；Motion、Pressable、Gesture、Overlay Host 和 Registry 均有对应私有源码实现。Overlay 的决策边界见 [Overlay Host 架构决策](./tsuki-v2-overlay-host-decision.md)。

- Motion 不依赖业务组件。
- 业务组件不得直接调用 `withTiming`、`withSpring` 或 `withDecay`；动画策略经 Motion primitive 和 preset 执行。
- 内部实现从私有模块路径导入。Motion、Pressable、Gesture、Overlay 的 barrel（如果有）都保持内部，不从 package root 导出。
- 不创建通用 `domain/` 层，也不为了跨组件复用而新增 public `Pressable`、`Motion` 或 `Gesture` API。
- 后续公共 API 只能由实际组件需求驱动，并经过独立 API 审查。

## 3. Motion Runtime

### 配置与主题

Motion 策略扩展现有 `ThemeConfig` / `ResolvedTheme`，复用 `TsukiProvider`、`ConfigProvider` 和现有 ThemeContext，不增加第二套 Provider。

```ts
interface MotionConfig {
  enabled?: boolean
  reducedMotion?: 'system' | 'always' | 'never'
  durationScale?: number
}
```

默认值：

```ts
{
  enabled: true,
  reducedMotion: 'system',
  durationScale: 1,
}
```

`getDefaultTheme()` 与 `mergeTheme()` 负责默认值和继承。`serializeTheme()` 不序列化 Motion 配置：它是动画运行策略，不是 NativeWind CSS 变量。

### 动画能力与倍率

内部基础能力包括 Timing、Spring、Decay、Delay、Cancel、Reverse、Transition Lifecycle 和 Reduced Motion。组件使用统一 Motion preset；组件专属时长仍可由对应 ComponentToken 覆盖。

Spring 的正倍率缩放保持阻尼比：

```ts
damping = damping / scale
stiffness = stiffness / (scale * scale)
mass = mass
```

`durationScale = 0`、Motion 全局关闭或 Reduced Motion 生效时，直接设置目标值，并仍调用完成回调。不得启动零时长循环或丢弃完成通知。

### 内部预设

| 预设                         | 用途           |
| ---------------------------- | -------------- |
| `fade`                       | 淡入淡出       |
| `scale`                      | 缩放           |
| `scale-fade`                 | 缩放与透明度   |
| `slide-up` / `slide-down`    | 垂直方向进出   |
| `slide-left` / `slide-right` | 水平方向进出   |
| `fade-up` / `fade-down`      | 淡入并垂直移动 |
| `spring-scale`               | 弹性缩放       |

预设定义效果，不统一覆盖组件时长。Popup、Dialog 等组件可通过自己的 ComponentToken 设定进入和退出时长。

### 生命周期

- 目标改变时取消旧动画；中途反向从当前 SharedValue 继续，不从旧起点跳变。
- 使用 generation 或等价机制，让过期动画及已排队回调不能覆盖新状态。
- 退出动画完成后再通知完成并卸载。
- Reduced Motion 下仍完成状态切换和完成回调。
- 逐帧动画更新留在 SharedValue/UI thread，不触发 React state 更新。
- `reducedMotion: 'system'` 通过共享的 `AccessibilityInfo` 订阅解析，并响应系统设置实时变化；组件不得各自创建系统订阅。

## 4. Pressable Runtime

以 React Native `Pressable` 为事件基础，以 Reanimated SharedValue 驱动反馈。初期供 Button、Cell 接入，不改变它们现有公共 Props。

内部反馈类型：`opacity`、`scale`、`background`、`overlay`、`none`。

- 保留当前暴露的原生按压事件、调用顺序、disabled、`hitSlop`、`pressRetentionOffset`、`testOnly_pressed` 与 Accessibility 语义。
- 按下、释放和取消时直接更新 SharedValue。普通反馈不依赖 React state。
- 内部 Pressable host 的 render props 和函数式 style 必须收到一致的 `pressed` 状态；不要因此扩大 Button 或 Cell 当前的 public type。
- NativeWind `className` 负责静态样式，Reanimated `animatedStyle` 负责动态样式。不得用 `cn` 或 `tailwind-merge` 合并 SharedValue 驱动的样式。
- 样式优先级：NativeWind `className` 提供静态样式；现有组件内联样式顺序保持不变（例如 Button 的 `styles.root` 在 `style` 之前）；对于同一属性，显式 `styles.root` / `style` 高于 pressed feedback，feedback 不写入被显式样式占用的属性。独立 overlay feedback 使用单独图层，不替换 root style。该优先级由聚焦测试固定。

## 5. Gesture Runtime

以 RNGH Gesture API 为基础。当前私有 Runtime 支持 Pan、Swipe；Pinch、Rotation、Tap 等手势由后续组件需求驱动。

统一的运动能力：

- Axis Lock、Min Distance、Active / Fail Offset、Max Distance
- Resistance、Snap、Velocity Projection、Decay、Spring Back

连续手势更新在 UI thread 执行。只在结束、取消或离散业务事件时使用 `scheduleOnRN` 通知 JS；不逐帧调度 React 更新。嵌套 ScrollView 必须明确 simultaneous、`requireExternalGestureToFail` 等协调关系。

- Pan 支持 horizontal、vertical、both、auto axis、axis lock、min distance、active/fail offset、max distance、bounds、resistance、snap point、velocity projection、decay 与 spring settle。
- Swipe 在 Pan Runtime 上提供开合目标、阈值吸附、速度投影、程序化开合与离散 open change 通知。
- Gesture callbacks、SharedValue 与动画 helper 只从私有源码路径使用；没有 Gesture package export 或 public Hook。

应用根节点由宿主应用提供 `GestureHandlerRootView`。不得假设 TsukiProvider 会自动提供根节点。

## 6. Overlay Host 决策

Batch 16B 已实现每个 React Root 独立的 `OverlayRegistry` 和根 `TsukiProvider` 唯一拥有的 `OverlayHost`。嵌套 `TsukiProvider` 复用 Registry 并保留自己的 ThemeContext，`ConfigProvider` 只负责主题作用域。当前内部调用仅从所属树的 Runtime Context 取得 Registry；Back 只交给最顶层未隐藏 Entry；Host 注销不等同于 Root 销毁，Root 永久销毁时由 StrictMode-safe lease 清理 Entry；Host StrictMode Effect replay 可以重新注册。当前实现与自动化结果见交付记录；原生验收按平台单独记录。

Batch 16B 的 Entry 生命周期与 Motion 协作约定如下：

```text
registered/mount -> entering -> entered -> exiting (still registered) -> Registry.unmount
```

Entry 在进入和退出动画期间都保持注册。独立 Mask / Content Motion 通道的成功完成回调推进生命周期；所有需要动画的退出通道完成后才请求 Registry 卸载。Reduced Motion 或零时长动画仍须调用完成回调，不使用固定 Timeout。重复关闭与卸载必须幂等；退出期间重新打开时保留 Entry ID 和 React key，并使旧退出回调失效。Overlay Transition 的首个 entering frame 显式从 0 初始化，不依赖 `useTransitionProgress(true)` 的初始值语义。

Batch 16B 增加了私有 Overlay Runtime 与真实 Registry/Host 驱动的 Playground Lab，没有增加 Overlay Runtime 公共 API。Lab 覆盖多层顺序、Host 注销/恢复、Theme 更新、Back 三种行为和触摸区域。Registry 解析、主题捕获、Back 行为、触摸、Safe Area、Keyboard、Accessibility、React Native `Modal` 边界和三端要求以 [Overlay Host 架构决策](./tsuki-v2-overlay-host-decision.md) 为准；原生验收不以自动化测试代替。

## 7. Arco 行为参考

参考仓库与源码基准：[arco-design/arco-design-mobile，`f528a26a4ea00f9e3ff66e23b84539f0ab6b70f5`](https://github.com/arco-design/arco-design-mobile/tree/f528a26a4ea00f9e3ff66e23b84539f0ab6b70f5)。下列参数是行为研究起点，不是 Tsuki 默认值；Batch 17 再逐项对照源码和交互。

| 组件        | 参考行为                     |
| ----------- | ---------------------------- |
| SwipeAction | 阻尼、开合迟滞、Layer / Push |
| PopupSwiper | 距离、比例、速度联合关闭     |
| Popup       | Mask 与 Content 分离动画     |
| Dialog      | Scale + Fade                 |
| Collapse    | 高度与箭头同步变化           |

草案记录的参考参数：SwipeAction threshold `0.15`、dampRate `15`、`300ms`；PopupSwiper 比例 `0.3`、距离 `10px`、速度 `200px/s`；Popup 进入 `450ms`、退出 `240ms`；Collapse 高度与箭头约 `200ms`。Arco 的 DOM TouchEvent、CSS Transition 和 react-transition-group 实现不移植到 React Native。

## 8. 目录规划与落地状态

```text
packages/tsuki/src/
├── motion/
│   ├── animation.ts
│   ├── easing.ts
│   ├── presets.ts
│   ├── token.ts
│   ├── types.ts
│   ├── useMotionConfig.ts
│   ├── useMotionValue.ts
│   ├── useReducedMotion.ts
│   └── useTransitionProgress.ts
├── pressable/
│   ├── pressable.tsx
│   ├── types.ts
│   └── usePressFeedback.ts
├── gesture/
│   ├── pan.ts
│   ├── swipe.ts
│   ├── resolve.ts
│   └── types.ts
└── overlay/
    ├── back-adapter.ts
    ├── context.ts
    ├── overlay-host.tsx
    ├── registry.ts
    ├── theme-bridge.tsx
    ├── types.ts
    ├── use-overlay-runtime.ts
    └── transition/
        ├── index.ts
        ├── overlay-transition.tsx
        ├── presets.ts
        ├── transition-completion.ts
        ├── transition-style.ts
        ├── types.ts
        └── use-overlay-transition.ts
```

Motion、Pressable、Gesture 与 Overlay 树列出当前私有源码文件。Overlay transition 子模块的 `index.ts` 仅供 Overlay Host 内部导入；不新增 Overlay root barrel 或 package root export，也不代表 public component。Hook 文件遵循项目现有 camelCase 例外；不需要 barrel 的模块可以省略 `index.ts`。Pressable、Gesture 与 Overlay Runtime 均没有 package root export。

## 9. 实施批次与验收

| Batch | 范围                       | 交付                                                   |
| ----- | -------------------------- | ------------------------------------------------------ |
| 12    | Architecture               | 架构文档与 Rule 修订                                   |
| 13    | Motion                     | 动画运行时与 Theme 集成                                |
| 14    | Pressable                  | 按压运行时及 Button/Cell 接入                          |
| 15    | Gesture                    | 私有 Pan/Swipe Runtime、运动算法与 Gesture Lab         |
| 16A   | Overlay Host Decision      | Host 架构决策文档与架构 Rule 更新                      |
| 16A.1 | Architecture Clarification | Root 所有权、命令式 Root 绑定、Back 与生命周期规则补充 |
| 16A.2 | Reference Study & Decision | 参考源码研究、最终 Host/API/生命周期决策               |
| 16B.0 | iOS Host Layer Validation  | View 与 FullWindowOverlay 原生层级、触摸及无障碍比较   |
| 16B.1 | Registry & Entry           | 每 Root Registry、稳定 Entry、订阅和生命周期           |
| 16B.2 | Host & Theme Bridge        | Root Host、Provider 接线和 Theme Context Bridge        |
| 16B.3 | Declarative Primitive      | 内部 Portal primitive 与显式组件 Context 桥接          |
| 16B.4 | Imperative Controller      | 显式绑定 Root 的 open/update/close 控制器              |
| 16B.5 | Back & Motion              | Back、Accessibility 与过渡完成协作                     |
| 16B.6 | Overlay Lab & Acceptance   | 实验台及三平台验收                                     |
| 17    | Arco Reference Lab         | 交互行为验收                                           |
| 18    | Component Integration      | 组件接入与回归                                         |

每个 Batch 独立审查和验收。自动化验收至少覆盖：Motion 参数归一化、Spring 参数计算、动画反向接管、旧回调失效、Reduced Motion 完成通知、Pressable 事件顺序、Gesture 方向锁、Swipe 阈值与速度判定、Snap 和 Resistance。

NativeWind v4、v5 必须使用独立 Consumer 验证 TypeScript、Package Build、Expo Config、iOS/Android bundle，以及 `className` 和 `animatedStyle` 的组合。bundle 成功不代替设备验收：iOS、Android 分别进行原生验证；Harmony 单独验证 RNOH 对 Reanimated、Gesture Handler 和 Worklets 的支持。

## 10. 非目标

- 全量复制 `packages/tsuki/bak/src`。
- 重写 Design Token 或 NativeWind CSS 架构。
- 新增公开 Reanimated Hook、SharedValue 或 Worklet API。
- 批量修改现有组件 API。
- 将 `react-native-teleport` 或平台 Portal API 引入 v2 Runtime。
- 将 React Native `Modal` 用作通用 Overlay Host。
- 强制所有动画使用 Spring。

## 11. Batch 14.1 — Theme transition consistency

### 定位

交互 Cell 的静态底色由 `cellSlot` 生成 NativeWind 背景类和 Theme CSS 变量。NativeWind v5 的 `VariableContextProvider` 会在 Theme 变量变化时重新计算样式。此前 Pressable Runtime 的 Reanimated 根样式也在 `progress === 0` 时写入 `idleColor`，所以 NativeWind 与 Reanimated 同时控制根节点的 `backgroundColor`。主题切换期间，两套更新可能按不同顺序落到同一节点，留下旧颜色。

Reanimated 4.7.1 会过滤颜色属性上的 `undefined`，因此返回 `backgroundColor: undefined` 不能清除已应用的颜色。问题只影响使用 background press feedback 的交互 Cell；Card、Surface 的底色不经过该 Pressable 样式路径。

### 修复

- Pressable 根动画样式只控制 opacity 和 scale，不再写入 idle 背景色。
- background feedback 使用独立的绝对定位 `AnimatedView`；NativeWind 继续控制根节点当前 Theme 底色，按压层只按现有 SharedValue 显示 pressedColor。
- 显式原生 `backgroundColor` 冲突时隐藏按压层，保留现有 `style` / `styles.root` 优先级。
- 没有增加公开 API，也没有给 Cell 增加独立主题动画。

相关改动：`packages/tsuki/src/pressable/pressable.tsx`、`packages/tsuki/src/__tests__/pressable.test.tsx`、`packages/tsuki/src/__tests__/cell.test.tsx`，以及 patch changeset `.changeset/steady-cell-theme-feedback.md`。Batch 12–14 的其他工作区修改均保留。

### 验收记录

- Android 设备：`emulator-5554`（Pixel 10 模拟器，x86_64，1080 × 2424），运行 NativeWind v5 Consumer，Metro 端口 `8082`。
- 本轮在设备上重验 Light → Dark → Light：默认 Cell 背景随当前 Theme 从浅色变为深色（Dark 为 `#1f2937`），切回浅色后恢复；未见闪帧或旧主题颜色残留。此前已通过的 20 次快速主题切换、主题更新时按压、8 次快速按压、disabled Cell、CellGroup、普通 Cell、Card 和 Surface 场景予以保留，没有重复执行。
- Inline Background 设备呈现通过：

  | 场景 | 实际结果 |
  | --- | --- |
  | 默认 Cell | 显示当前 Theme 背景；Theme 更新后跟随新值 |
  | `style.backgroundColor` | 静态显式背景显示；与 feedback 同用时显式绿色背景保持优先 |
  | `styles.root.backgroundColor` | 静态显式背景显示；与 feedback 同用时显式琥珀色背景保持优先 |
  | `className` | 静态 NativeWind 背景显示正常 |
  | `className` + feedback | 空闲时显示 class 背景；按压变为当前 Theme 的 pressedColor，松开恢复 class 背景 |
  | `style` + feedback | 按压前后均保留显式绿色背景 |
  | `styles.root` + `style` | 保留原有优先级，`style` 的青色背景覆盖 `styles.root` |
  | Button 的 `styles.root` + `style` | 显式 `style` 背景优先，设备显示 `#fef08a` |
  | Press In / Press Out | 按压反馈出现；深色 Theme 下短暂呈现 `#374151` pressedColor，松开平滑恢复，无旧色残留 |

- 为复现问题，本轮发现 NativeWind v5 无法从动态 style callback 合并静态 inline 样式，导致 Cell 和 Button 的显式 inline 背景丢失。`NativePressableHost` 现在仅对 callback style 保留 resolver；静态 style 作为常规数组传给原生 Pressable，使 NativeWind 能在 class 样式之后合并 inline 样式。新增断言覆盖 Button 优先级和 Cell className + feedback；没有新增公开 API，也没有改动本任务范围外的组件或 Design Token。
- 自动回归结果：
  - `pnpm run package:typecheck`：通过，退出码 0。
  - `pnpm run package:test:v2`：通过，12 suites / 90 tests，退出码 0。
  - `pnpm run lint`：通过，退出码 0。
  - `pnpm run build`：通过，退出码 0；Bob 提示 `esm` 选项关闭而 `package.json` 设置了 `exports['.'].require`，未阻断构建。
  - `pnpm run consumer:v4:typecheck`：通过，退出码 0。
  - `pnpm run consumer:v5:typecheck`：通过，退出码 0。
  - `pnpm run consumers:tarball`：通过，v4/v5 tarball 均完成类型检查及 Expo 开发 bundle，退出码 0。该脚本同时导出了 iOS 与 Android 静态 bundle；这不属于 iOS 设备验收。日志包含 NativeWind 丢弃 41 条 React Native 不支持的 CSS 声明、npm 安装脚本提示和 Node deprecation 提示，均未导致失败。
  - `pnpm run changeset:status`：命令成功，退出码 0；现有 changeset 集合报告 `@ftsukic/tsuki` 为 major。本次独立修复 changeset `.changeset/steady-cell-theme-feedback.md` 为 patch。
  - `git diff --check`：通过，退出码 0（最终检查）。
- `apps/playground-nw5/android` 已核实为 Expo Prebuild 目录：忽略规则来自该 Consumer 的 `.gitignore`，Git 跟踪文件数为 0，配置 package 为 `com.ftsukic.tsukinativewindv5`，目录中的 Android 原生入口与配置对应。未发现 Gradle / `expo run:android` 构建进程占用它。系统自动审查最初拒绝了递归删除操作；用户随后手动清理。最终确认该目录不存在，未触碰其他 Consumer 目录。
- 最终 Git 状态仍在 `tsuki-1x-refactor`，没有 staged 文件；Batch 12、13、14 和 14.1 的既有 dirty changes 均保留，临时 Consumer 页面 `App.tsx` 已按原始哈希恢复且没有出现在 Git Status 中。用于恢复的哈希副本也已由用户手动删除，最终确认不存在。本次没有增加公共 export，没有提交、推送或发布。
- iOS: `Skipped by decision — not included in Batch 14.1 acceptance criteria.`

当前状态：Pressable / Cell Theme 切换和本轮 Android Inline Background 验收均通过，所有请求的自动化命令均以退出码 0 完成；Android Prebuild 目录与仓库外的还原副本均已手动清理并确认不存在。Batch 14.1 状态为 **Completed**，满足进入 Batch 15 的条件。iOS 不属于本批次验收条件，也不是阻塞项。

## 12. Batch 14.2 / 15 — Interaction Lab

Playground 在 `apps/playground/app/labs/interaction/` 提供 Interaction Lab。页面直接使用 `@tsuki-v2/*` 私有源码 alias；原有 `@ftsukic/tsuki` alias 仍指向 v1 历史源码。Interaction Lab 页面不属于组件 Fixture Catalog，也不改变现有 v1 Fixture。

- Motion Lab 展示 v2 MotionValue、presets、全局 Motion policy 和 interruption 行为。
- Pressable Lab 展示五种反馈模式、原生按压事件顺序与样式冲突优先级。
- Gesture Lab 展示 Pan、Swipe、Resistance、Snap 和 Nested Scroll；可实时调整阈值、边界、阻尼、弹簧和手势协调方式。Pan 活跃时暂停外层页面滚动。Nested Scroll 用 Native 手势和纵向 ScrollView 包住互斥 Tap/Pan 行；默认让 Native ScrollView 等待横向 Pan 失败，另有 simultaneous 模式用于对比。
- 位移样式只从 SharedValue 读取。调试数值只在方向改变、生命周期改变或手势结束时同步到 JS。
- 使用说明见 [`docs/guide/interaction-lab.md`](../guide/interaction-lab.md)。

### Android 设备验收

- 在 `emulator-5554` 上打开 Playground Motion Lab：Timing、Spring 和 Timing/Spring 并行播放均完成；Decay 在 `±96 px` 边界稳定；中途反转后以目标 `0` 完成，取消时报告 `Cancelled at current position`。设置全局 Reduced Motion 为 `always` 后，局部预览显示 `Effective: immediate` 并完成到目标。
- Pressable Lab 的五种反馈模式均切换并实际按压；原生事件按 `press in → press → press out` 记录。自动化也覆盖 disabled、`testOnly_pressed`、连续按压和样式冲突。
- Gesture Lab：Pan 垂直拖动显示 `down` 方向及 `39 px` 位移，释放后外层页面继续滚动；Swipe 慢速越过阈值吸附到 `-120 px`，快速右划以 `610 px/s` 释放并吸附到 `120 px`；Snap 多点模式吸附到 `100 px`，单点模式吸附到 `0 px`。固定 `.85` 和可调 `.3` Resistance 区域均已拖动；一次可调阻尼操作记录 `93 px` 释放位置。
- Nested Scroll 默认协调模式下，横向拖动激活 Pan 并取消行内 Tap；纵向拖动滚动内层列表，列表外的标题与协调控件保持原位。

Android 验收不代表 iOS 或 HarmonyOS 原生设备验收；本轮未在这些平台运行设备验证。

## 13. Batch 16B — Overlay Runtime

### 实现范围

- 每个根 `TsukiProvider` 持有独立 Registry 和唯一 Host；嵌套 `TsukiProvider` / `ConfigProvider` 复用 Registry，并为 Entry 捕获当前 Theme scope。
- Registry 提供稳定 Entry ID、不可变 Snapshot、更新不重排、幂等卸载、无 Host 时排队和 StrictMode-safe Host 注册租约。
- Host 用 React Native `View` 渲染有序层，根节点与 layer wrapper 使用 `box-none`；Entry 通过现有 `ThemeContext` Bridge 恢复并跟随其来源 scope 的主题提交。
- Android 与 Harmony 平台使用 Host 生命周期内单个 `BackHandler` 订阅；iOS 不注册硬件 Back 行为。没有增加 public Overlay API、package root export 或依赖。
- Playground Overlay Lab 直接调用私有 Runtime，覆盖多层顺序、Back、Theme 和触摸；没有新增 Fixture Catalog 项目。

### 自动化结果

下列命令均在本轮实际运行并以退出码 0 完成：

| 命令 | 结果 |
| --- | --- |
| `pnpm run package:typecheck` | 通过 |
| `pnpm run package:test:v2` | 14 suites / 116 tests 通过 |
| `pnpm run playground:typecheck` | 通过 |
| `pnpm run playground:test` | 10 suites / 29 tests 通过 |
| `pnpm run lint` | 通过 |
| `pnpm run build` | 通过 |
| `pnpm run consumers:tarball` | v4/v5 tarball 类型检查及 iOS/Android bundle 通过 |
| `pnpm run fixtures:check` | 64 fixtures 通过 |
| 目标 Markdown / TS / TSX 的 `pnpm exec prettier --check` | 通过 |
| `git diff --check` | 通过 |

### Android 设备验收

- Playground Development Build 在 Pixel 10、Android API 37 模拟器（`emulator-5554`，1080 × 2424）上构建并运行。`npx expo run:android --no-bundler` 退出码 0。`@expo/agent-cli dev --android --device emulator-5554 --detach --wait-ready --port 8081` 退出码 1：设备选择步骤未识别该 ADB serial；改用 Expo CLI 无设备参数的本机 Android build 后成功安装。Runtime tree 未能连接 RN DevTools，因此实际交互通过 Android UI hierarchy、触摸和硬件 Back 输入检查。
- Stack Lab 实际显示三个叠层，最新 Entry 绘制在最上方；更新顶层保留顺序，删除中间 Entry 后剩余顺序为 1、3。点击底层页面控制区仍能更新和清除未覆盖的 Entry。
- 临时注销 Host 后 Entry 留在 Registry 且不再绘制；重新注册后同一 Entry 顺序恢复。切回 Interaction Lab 时根 Host 数量仍为 1。
- Android 硬件 Back 分别验证 `dismiss` 移除顶层、`consume` 保留顶层、`passthrough` 返回 Interaction Lab。一次按键只更新一次 Registry Back 结果；单元测试还验证 passthrough 不向下扫描。
- Root Theme overlay 在 Android 夜间模式 light → dark → light 更新期间保持挂载；scheme、primary 和 background 均跟随。ConfigProvider overlay 从蓝色 primary 更新为 rose（`#e11d48`）；嵌套 Light / Dark Provider overlay 分别呈现各自 scheme 和颜色。
- Touch Lab 实际验证无遮罩卡片外的页面点击穿透、全屏遮罩外侧与内容区域分别响应、叠层内顶层内容先响应且空白区域交给下层 mask。
- 为验证系统主题传播，测试期间将模拟器从系统 light 临时切换到 dark 再切回 light；最终夜间模式为 `no`，恢复为测试前状态。

### iOS 与 HarmonyOS

- iOS 原生绘制、Safe Area、键盘和 VoiceOver 未在设备上验收。
- HarmonyOS 未完成原生验收：当前仓库没有 RNOH 宿主或锁定的 RNOH target version。该适配依赖宿主根 ArkUI `onBackPress` 调用 `dispatchBackPress()` 后转发到 RN；参见 [RNOH 接入文档](https://gitee.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/RN-Native%E6%8E%A5%E5%85%A5.md)。当前 `BackHandler` 事件订阅和清理模式遵循 [React Native BackHandler 文档](https://reactnative.dev/docs/0.86/backhandler)，但不能据 Android 验收推断 Harmony 兼容。

## 14. Batch 16B — Overlay Transition Runtime follow-up

本轮在 Batch 16B Overlay Host 之上加入私有 Transition Runtime。Registry 明确记录 `hidden / entering / entered / exiting` presentation phase，并以 Entry ID 与 generation 拒绝过期完成回调；关闭时保留 Entry 与 Host 子树，等 Mask 和 Content 两条动画通道都完成后才卸载。重新打开或反转时会推进 generation，因此旧动画不能清理新一轮展示。Reduced Motion 使用同一完成路径立即收敛，不通过 timeout 推断动画结束。

- Mask 与 Content 使用独立 MotionValue / SharedValue。预设分别配置两条通道；Timing 和 Spring 参数可独立调节。取消、反转和并行 Entry 都由当前动画 generation 管理。
- Worklet 进度 reaction 只捕获数值 generation，不捕获含 React 内容的 Overlay Entry；Android 重开检查中未再出现 FiberNode Worklet 警告。
- Playground 新增 Transitions Lab：提供预设、Mask / Content 选择、Timing / Spring 调参、打开与关闭、进入中关闭、退出中重开、快速序列、并行层、Back 和 Reduced Motion；诊断区展示 Entry ID、phase、两路进度、动画类型、generation、完成状态和 Registry 数量。
- 覆盖无 Mask 时仅等待 Content 的完成路径，也覆盖多个可见通道协调、StrictMode Provider 生命周期、Entry 重开稳定性和 duration 0。没有新增 public API、package root export 或依赖。

### 自动化结果

本轮实际运行且通过：

| 命令 | 结果 |
| --- | --- |
| `pnpm run package:typecheck` | 通过 |
| `pnpm run package:test:v2` | 15 suites / 124 tests 通过 |
| `pnpm run playground:typecheck` | 通过 |
| `pnpm run playground:test` | 10 suites / 31 tests 通过；日志有来自 `packages/tsuki/bak` 历史代码的 Reanimated 提示，不影响通过 |
| `pnpm run lint` | 通过，零 warning |
| 目标文件 `pnpm exec prettier --check` | 通过 |
| `git diff --check` | 通过 |

### Android 设备验收

- Pixel 10 / Android API 37 模拟器 `emulator-5554`（1080 × 2424）完成 Development Build 构建并安装。Expo Agent 首次按 ADB serial 选择设备失败；改用本机 Expo CLI build 和本地 Agent CLI 服务后，Metro、设备 runtime tree 与应用均连接成功，runtime error 检查没有报告错误。
- 在设备上验证进入中关闭、退出中重开、快速打开关闭序列、Mask None、Reduced Motion 和并行层。重开沿用原 Entry ID，generation 前进；并行 Entry 按层级绘制，移除上层后下层仍在。快速序列和 Reduced Motion 关闭最终都将 Registry 数量收敛到 0。
- Android 硬件 Back 对两个活动 Entry 各消费一次，数量依次从 2 到 1、再到 0，停留在 Transitions Lab。UIAutomator hierarchy 确认 Mask 占满屏幕、Content 可点击；实体点按卡片内容和遮罩外侧都分别关闭 Entry。
- 设备运行观察了动画完成状态、反转和交互结果；本轮没有录制逐帧视频或测量帧率，因此不将此验收描述为帧级平滑度检查。

本轮未运行 iOS 或 HarmonyOS 原生设备验收。实现和自动化结果不能替代这两个平台上的设备确认。

## 15. Batch 16B.5.6 — Transition Review Fixes

本批次修复 Overlay Transition 的 Progress Listener 调度，并让 Transition Style 按 `entering` / `exiting` 生命周期选择 `MotionPreset.enter` 或 `MotionPreset.exit`。进度仍使用原有可见度 SharedValue；Enter 将 `0 → 1` 映射到 `enter.from → enter.to`，Exit 将 `1 → 0` 映射到 `exit.from → exit.to`。位移继续按屏幕宽高归一化，缺省属性保持 identity 值。已有对称预设的 Enter / Exit 画面保持一致。

Progress reaction 在 UI Worklet 侧读取 listener-presence SharedValue。没有 listener 时不调用 `scheduleOnRN`；有 listener 时仅在 10% 档位改变时通知。JS 侧保留 `onProgressRef`，listener 增删通过 effect 同步到 SharedValue；Mask 和 Content 使用相同门控逻辑。

测试用可控 Timing / Spring 完成回调覆盖双通道进入和退出、两种完成顺序、重复完成、取消、Enter / Exit 反转、旧 generation 回调、稳定 SharedValue、无 Mask 单通道和 Progress Listener 动态增删。独立 Style 测试覆盖 Enter / Exit 端点、非对称 opacity / scale / 位移、屏幕尺寸归一化、缺省属性和现有对称预设。

Playground 的 Transition Lab 加入仅供内部验收的非对称 preset，用于实际宿主上的 Enter / Exit 验收。没有新增公共 API、根导出、package export 或第三方依赖。

本批次最终自动化结果和 Android 模拟器验收明细见 [Batch 16B.5.6 完成报告](./tsuki-v2-16b-5-6-completion-report.md)。

## 16. Batch 16B.3 — Declarative Overlay Primitive

Overlay Runtime 新增私有 `packages/tsuki/src/overlay/overlay-portal.tsx`。`OverlayPortal` 以受控 `visible` 驱动 Entry，提交阶段从当前 `OverlayRuntimeContext` 解析所属 Root Registry，并捕获当前 Theme scope。它不维护业务 open state，不处理遮罩视觉样式或内容布局，也不进入 package root exports。

- 首次 `visible=true` 创建 Entry；内容、Mask、Transition、Back 配置和可见状态更新保留现有 ID。首次 `visible=false` 不创建 Entry。
- 隐藏会更新现有 Entry 为 `exiting`；Host 保留子树并协调已启用的 Mask / Content Transition。退出完成后 Registry 删除 Entry。Portal 若仍挂载，下一次显示会检测失效 ID 并创建新 Entry；退出期间重开则保留原 ID/key，推进 generation，使旧完成回调失效。
- Portal 真正卸载时，通过本地 lease 延迟一个 microtask 清理其 Entry。StrictMode 同步 cleanup/setup replay 会重新取得同一所有权；真正卸载后没有后续 setup，Entry 会被幂等释放。Portal 不订阅完整 Registry Entry Snapshot。
- Root 与嵌套 `ConfigProvider` / `TsukiProvider` 的 Theme 沿用既有 Theme Bridge。Dialog 等业务组件必须把所需 Context Provider 显式放入 Portal children；不提供任意 React Context 的通用自动桥接。
- Back 使用 Host 现有统一分发；Portal 不注册独立 `BackHandler`。`dismiss` 的关闭回调由受控 owner 同步到 `visible=false`。

Interaction Lab → Overlay → Declarative 使用真实 `OverlayPortal`，演示显隐、内容/Mask/Transition 更新、Theme、显式业务 Context、多 Portal、Provider owner 卸载和 StrictMode。独立 Runtime 诊断面板显示 Entry ID、数量、phase、generation、当前 Theme、Context 值和 Host 数量。

本批次自动化命令、设备验收结果、Git 状态和未实现项见 [Batch 16B.3 完成报告](./tsuki-v2-16b-3-completion-report.md)。

## 17. Batch 16B.4 — Root-bound Imperative Controller

私有 `useOverlayController()` 由 Hook 所在的 Overlay Runtime Context 绑定到确定的 Root Registry。默认 `current` scope 捕获当前位置的 Theme 与 scope；显式 `'root'` scope 捕获所属 Root 的最新根 Theme，便于把 Controller 传给树外服务。该 Hook 不从模块级状态寻找 Root；缺少 Root 时会显式抛错。

- `open()` 每次创建一个新的可见 Entry，并返回具有稳定 ID 的 `{ update(), close() }` Handle。Controller、Handle 和类型都只位于内部 `overlay/` 路径，没有新增 package root 或 package export。
- `update()` 不接受 `visible`，内容、Mask、Transition 与 Back 配置更新都保留 ID、React key 和挂载顺序。Entry 已在退出期间时仍可更新配置，但不会复活；退出完成或 Root dispose 后，旧 Handle 失效。
- 首次 `close()` 通过 Registry 进入 `exiting`，等待现有 Mask / Content Transition 协调完成后卸载。重复关闭返回 `false`。Back 复用 Host 的统一分发，不注册独立 BackHandler。
- Hook owner 最终卸载时，由 StrictMode-safe lease 保留重放期间的所有权；确认真实卸载后，owner 创建的活动 Entry 进入正常退出动画。外部服务保存的 Controller 只能在其 Hook owner 保持挂载期间使用；旧 Handle 在 owner 卸载后失效。
- Playground 的 Imperative Lab 使用真实 Root Runtime，覆盖 current/root Theme、多层 Entry、Update / Close、关闭中更新、快速关闭、重复关闭、Mask、Timing / Spring、Android Back、Declarative + Imperative 混合和 Registry 诊断。

本批次的实际自动化、Android 验收、未执行项目和 Git 状态见 [Batch 16B.4 完成报告](./tsuki-v2-16b-4-completion-report.md)。

## 18. Batch 16B.5 — Accessibility Runtime

Overlay Runtime 为每个根 `TsukiProvider` 的页面子树提供私有 Accessibility boundary，并将根 `OverlayHost` 保留为同级节点。最高层有效 modal 隔离页面与下层 modal；退出动画完成前维持隔离。边界上方的 non-modal Entry 可以继续访问；只有 non-modal Entry 时页面保持可访问。

- `OverlayPortal` 与 `useOverlayController()` 共用 Entry 的 `modal | non-modal` 语义，默认 non-modal；配置更新保留 Entry ID。
- 初始焦点与返回焦点由内容 owner 通过 `RefObject<View | null>` 提供。Runtime 等待目标布局和屏幕阅读器状态，再按 Registry ID / generation 验证请求并发送原生 focus 事件；过期请求和 Root 卸载会取消调度。
- 新增 Accessibility Lab 展示 modal 隔离、初始/返回焦点目标、嵌套 Portal、Controller Entry、关闭和运行时诊断。
- 实现保留在私有 `packages/tsuki/src/overlay/accessibility/`，未新增公共 export、依赖或 Native Module。

当前状态：自动化验证通过，Android 模拟器已启用真实 TalkBack，并观察到初始焦点和嵌套 modal 的 Back 焦点恢复。Windows `agent-device` 触控注入未能可靠区分 TalkBack 双击激活与连续触控；TalkBack 线性导航和 modal 内按钮激活尚未形成可重复、明确的设备证据。因此 **Batch 16B.5 保持 Pending Android TalkBack validation**，不得以自动化测试或 Accessibility tree snapshot 替代缺失的交互验收。详细结果、设备环境和剩余风险见 [Batch 16B.5 完成报告](./tsuki-v2-16b-5-completion-report.md)。
