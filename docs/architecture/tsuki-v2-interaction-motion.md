# Tsuki v2 Interaction & Motion Architecture

> 状态：Batch 15 — Motion、Pressable、Pan/Swipe 与 Interaction Lab 已实现；Android 验收记录见本文末尾基线：`tsuki-1x-refactor`，`40f16dc` 范围：Motion、Pressable、Gesture、Overlay原则：先建立统一运行时，再迁移业务组件。

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
| Overlay / Portal | 当前 v2 没有 Overlay Runtime 或 Portal Host。`react-native-teleport` 是开发依赖，不是 peer dependency；v1 由应用提供 `PortalProvider`，当前 v2 TsukiProvider 没有 Host，v4/v5 Consumer 也未安装该依赖。 |

内部模块不会因为目录建立而成为 package API。当前 `packages/tsuki/src/index.ts` 和组件 barrel 中已存在的导出仍是兼容面；后续内部实现不得借机删除或改名。

## 2. 模块与依赖方向

运行时分为四个内部模块：

| 模块      | 职责                                                     |
| --------- | -------------------------------------------------------- |
| Motion    | 动画执行、配置解析、预设与过渡生命周期。                 |
| Pressable | 原生按压事件与视觉反馈之间的适配。                       |
| Gesture   | 手势识别、UI thread 运动、释放决策与吸附。               |
| Overlay   | 浮层生命周期、层级与宿主适配；Portal 方案待 spike 决策。 |

```text
Button / Cell / future Popup / Dialog
                 |
          Pressable / Gesture
                 |
               Motion
                 |
        Reanimated / Worklets

Overlay ── Motion
   ├────── Gesture (optional)
   └────── Portal Adapter (pending decision)
```

此图描述目标依赖方向；当前源码只实现 Motion 与 Pressable，Gesture 和 Overlay 尚未实现。

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

## 6. Overlay 与 Portal 决策

Overlay 暂不实现。先对独立 Portal 方案做技术验证，再建立 Overlay Runtime。候选方案：

1. 将 `react-native-teleport` 作为正式 peer dependency。
2. 使用 React Native `Modal`。
3. 使用独立的应用级 Overlay Host。

Spike 必须覆盖多层顺序、Portal 生命周期、Android BackHandler、滚动锁、键盘避让、Safe Area、Accessibility、iOS/Android 真机表现和 npm tarball 消费者安装。通过 spike 记录取舍与宿主配置，再确定 Overlay 结构。未完成决策前，不新增 Portal 依赖或复制 v1 Portal 实现。

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
└── gesture/
    ├── pan.ts
    ├── swipe.ts
    ├── resolve.ts
    └── types.ts
```

Motion、Pressable 与 Gesture 树列出当前源码文件。Overlay 的结构仍等待 Portal spike 决策。目录表示私有运行时职责，不代表 public component。Hook 文件遵循项目现有 camelCase 例外；不需要 barrel 的模块可以省略 `index.ts`。Pressable 与 Gesture Runtime 没有 barrel，也没有 root export。

## 9. 实施批次与验收

| Batch | 范围                  | 交付                                           |
| ----- | --------------------- | ---------------------------------------------- |
| 12    | Architecture          | 架构文档与 Rule 修订                           |
| 13    | Motion                | 动画运行时与 Theme 集成                        |
| 14    | Pressable             | 按压运行时及 Button/Cell 接入                  |
| 15    | Gesture               | 私有 Pan/Swipe Runtime、运动算法与 Gesture Lab |
| 16A   | Portal Spike          | Portal 技术决策                                |
| 16B   | Overlay               | 浮层运行时                                     |
| 17    | Arco Reference Lab    | 交互行为验收                                   |
| 18    | Component Integration | 组件接入与回归                                 |

每个 Batch 独立审查和验收。自动化验收至少覆盖：Motion 参数归一化、Spring 参数计算、动画反向接管、旧回调失效、Reduced Motion 完成通知、Pressable 事件顺序、Gesture 方向锁、Swipe 阈值与速度判定、Snap 和 Resistance。

NativeWind v4、v5 必须使用独立 Consumer 验证 TypeScript、Package Build、Expo Config、iOS/Android bundle，以及 `className` 和 `animatedStyle` 的组合。bundle 成功不代替设备验收：iOS、Android 分别进行原生验证；Harmony 单独验证 RNOH 对 Reanimated、Gesture Handler 和 Worklets 的支持。

## 10. 非目标

- 全量复制 `packages/tsuki/bak/src`。
- 重写 Design Token 或 NativeWind CSS 架构。
- 新增公开 Reanimated Hook、SharedValue 或 Worklet API。
- 批量修改现有组件 API。
- 未完成 Portal spike 就增加 Portal 依赖。
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
- `apps/nativewind-v5-consumer/android` 已核实为 Expo Prebuild 目录：忽略规则来自该 Consumer 的 `.gitignore`，Git 跟踪文件数为 0，配置 package 为 `com.ftsukic.tsukinativewindv5`，目录中的 Android 原生入口与配置对应。未发现 Gradle / `expo run:android` 构建进程占用它。系统自动审查最初拒绝了递归删除操作；用户随后手动清理。最终确认该目录不存在，未触碰其他 Consumer 目录。
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
