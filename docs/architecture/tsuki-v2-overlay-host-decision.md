# Tsuki v2 Overlay Host Architecture Decision

| 项目 | 说明 |
| --- | --- |
| 决策状态 | 已采纳；Batch 16A、16A.1 与 16A.2 完成架构决策；Batch 16B 已实现 Registry 生命周期、统一双通道 Transition Runtime、内部声明式 Portal、Root-bound Imperative Controller、Accessibility Runtime 与 Playground Lab。Batch 16B.5 的 Android TalkBack 交互验收仍 Pending，结果见对应交付记录。 |
| 决策日期 | 2026-11-20 |
| 适用范围 | Tsuki v2，同一 React Root 中的多个浮层。 |

## 1. 背景与问题

浮层需要脱离当前页面的局部布局，同时继续使用同一应用的 Theme、动画、Back 和 Accessibility 约定。v1 归档实现使用 `react-native-teleport` 和外部 `PortalProvider`；v2 当前没有 Overlay Host。直接复制 v1 会把旧宿主依赖和生命周期假设带入新 Runtime。

本决策确定单 React Root 内的挂载基础设施、层级、主题恢复和平台适配边界。它不定义 Toast、Dialog、Popup 等组件 API，也不表示 Runtime 已经存在。

## 2. 最终技术决策

| 领域 | 决策 |
| --- | --- |
| Host | 每个 React Root 由根 `TsukiProvider` 唯一拥有一个应用级 `OverlayHost`，Host 位于根 ThemeContext 作用域内并保持在导航页面生命周期之外。 |
| 渲染 | React Native `View` 是三端 Host 的共同基线；iOS `FullWindowOverlay` 仅在 Batch 16B.0 验证后作为可选原生层适配。 |
| 生命周期 | 根 `TsukiProvider` 为每个 Root 创建私有 `OverlayRegistry`；Host 临时卸载与 Root 永久销毁是不同生命周期。 |
| Theme | 复用现有 `ThemeContext` / `ResolvedTheme`；内部 Overlay Runtime Context 传递所属 Root 的 Registry，Theme Context Bridge 保留调用位置的主题。 |
| 动画 | 由现有 Motion Runtime 执行动画；退出动画完成后再卸载 Entry。 |
| Back | Android 与 HarmonyOS 使用统一的 Host 级适配接口；iOS 不实现 Android Back 行为。 |
| 排除项 | v2 Runtime 不依赖 `react-native-teleport`、平台 Portal API 或通用 React Native `Modal` 底座。 |

### 2.1 Reference Study Findings

- React Native Reusables supplies styled compound-component recipes and delegates state, Portal storage, accessibility focus, and Back handling to rn-primitives. Its current iOS Dialog recipe conditionally wraps the Overlay in `FullWindowOverlay`.
- rn-primitives uses one module-scoped Zustand Portal store. Named hosts share that store and do not isolate React Roots. Portal entries use stable name keys; Dialog explicitly re-provides its own Root Context.
- Arco Mobile composes Dialog over Masking, Popup over Masking, and ActionSheet over Popup. Its `open(config)` handle exposes `close()` and `update(config)`, while its implementation creates browser DOM containers and React DOM roots.
- react-native-screens `FullWindowOverlay` inserts a native container into a `UIWindow` view hierarchy. It is a native layer wrapper; it does not provide Registry, Entry, or context management. Its accessibility container defaults to modal semantics.
- Detailed source facts, version baseline, and analysis are in [Overlay Reference Study](./tsuki-v2-overlay-reference-study.md).

## 3. 总体架构

`OverlayHost` 属于应用根 Provider 作用域，与导航树处于同一稳定的根生命周期。它不随 Screen 切换而卸载；嵌套 `TsukiProvider` 和 `ConfigProvider` 只改变 Theme 作用域，不创建额外 Host 或 Registry。

```text
Application Root
└── TsukiProvider (Root; owns this Root's Registry and OverlayHost)
    ├── Application Navigation
    │   ├── Screen A
    │   ├── Screen B
    │   └── Screen C
    │       └── nested TsukiProvider / ConfigProvider (Theme scope only)
    └── OverlayHost (React Native View)
        ├── Overlay Entry 1
        ├── Overlay Entry 2
        └── Overlay Entry 3

OverlayHost ↔ per-root OverlayRegistry
```

一个 Root 中的所有浮层通过同一 Host 排序和渲染。Registry 是每个 Root 私有的运行时实例，不是跨应用 Root 的模块级万能管理器。Host 不承诺覆盖 React Native Modal、独立原生 Window 或其他独立呈现层。

### Host Ownership and Root Scope

- 每个 React Root 只能有一个 Overlay Host 所有者。根 `TsukiProvider` 创建该 Root 的 `OverlayRegistry` 并拥有唯一 `OverlayHost`；Host 在根 `ThemeContext` 作用域内渲染，且挂载不依赖 Screen 或页面组件。
- 嵌套 `TsukiProvider` 不创建 Host 或 Registry，而是继承所属 Root 的 Registry；它仍可提供自己的 `ThemeContext`。从该作用域挂载的浮层使用调用位置当前解析出的 `ResolvedTheme`。
- 嵌套 Provider 的卸载只结束自己的主题作用域，不影响根 Host、Registry 或其他 Entry。
- `ConfigProvider` 只创建主题作用域，不创建 Host 或 Registry。
- 根 Provider 创建 Registry 后，通过私有的内部 Overlay Runtime Context 将 Registry 传给子树。嵌套 Provider 继承已有 Context；该 Context 不进入 public exports。
- 本节描述的 Root/Host 归属已由 Batch 16B 落入源码：根 `TsukiProvider` 创建 Registry 并渲染 Host，嵌套 Provider 继承 Registry。当前实现细节位于 `packages/tsuki/src/overlay/`；Android、iOS 与 HarmonyOS 的设备验收仍需分别记录，自动化测试不代替设备验证。

### Registry Resolution for Imperative Calls

- 组件树内调用从所属 Root 的内部 Overlay Runtime Context 取得 Registry，并捕获当前 `ThemeContext` 的 `ResolvedTheme`。内部 Theme Context Bridge 在 Host 渲染 Entry 时恢复该主题；源主题更新时，已挂载 Entry 也要收到更新后的主题。
- 组件树外调用只有通过显式绑定到所属 Root 的内部 controller 才能取得该 Root 的 Registry。此路径使用该 Root 的根主题，不得声称继承了任意组件或 `ConfigProvider` 的主题上下文。
- Registry 不推断调用者的 ThemeContext。禁止模块级 `activeRendererId`、最后注册 Renderer 默认目标和跨 Root 共享 Registry。无法确定所属 Root 时必须明确失败，不得随机选 Root。
- 当前 v2 没有 Overlay Runtime 命令式 API；现有组件命令式 API 是否能满足 Root 绑定尚未审查。Batch 16B 的组件 API 集成必须定义显式 Root 绑定与无法确定 Root 时的失败边界；在此之前，不宣称任意树外调用已受支持。
- 不为解决内部 Registry 解析新增未经独立审查的 public Portal API。

## 4. OverlayHost 职责

- 在应用根坐标系提供稳定挂载区域，并订阅所属 Registry。
- 按 Registry 提供的顺序渲染多个 Entry；不按 Toast、Dialog、Popup 等业务类别建立独立层级系统。
- 使用可穿透的 Host 根触摸策略；具体 Entry 和遮罩声明自己拥有的命中区域。
- 注册和注销 Host；Host 注销只解除挂载关联，不销毁 Root Registry 或其 Entry。
- 保留 Entry 自身的 React Native Accessibility 语义；Host 不把所有浮层自动变成模态浮层。

Host 不负责组件的打开或关闭语义、动画、Theme 生成与合并、Safe Area、Keyboard、锚点测量或定位。

## 5. OverlayRegistry 职责

Registry 是私有的每 Root 生命周期与顺序记录，内部操作为：

```text
mount
update
unmount
registerHost
unregisterHost
dispatchBack
```

约束如下：

- Registry 只管理通用 Entry 的生命周期、Host 关联和挂载顺序。它不承载 Toast、Dialog、Popup 的业务语义，不实现动画，也不合并 Theme。
- 每个 Entry 在所属 Registry 内有稳定且唯一的 ID；渲染该 Entry 时使用同一 ID 作为稳定 React key。`update` 保留 ID 和层级位置；删除任意中间 Entry 不得将其他 Entry 的组件状态转移给相邻 Entry。
- Host 尚未 ready 或临时不可用时，`mount` 将 Entry 保留为待渲染请求；Host 注册后按原有顺序恢复渲染。没有 Host 时不会把 Entry 渲染到页面内的临时位置。
- `update` 只替换现有 Entry 的内容或状态，不改变其层级顺序。只有卸载后重新挂载才获得新的层级位置。
- `unmount` 必须幂等，移除对应 Entry 并释放它持有的订阅、关闭回调和运行时引用。只有 Root 永久销毁时才清理该 Root 的全部 Entry，不能遗留回调；Host 注销遵循独立的临时生命周期。
- `registerHost` / `unregisterHost` 维护当前 Root 的唯一 Host 关联；重复注册必须幂等。`unregisterHost` 只解除 Host 注册，不清空 Registry 中已挂载或待渲染的 Entry；重新注册后保留原有挂载顺序。导航页面的挂载和卸载不得改变该关联。
- Host 自身的 Registry 订阅和平台监听随 Host 注销清理；Root 永久销毁时才释放该 Root 的 Registry、Entry、回调和订阅。Host 暂时不可用不能等同于 Root 销毁。
- Registry 不控制任意 Native Modal 或独立原生 Window 的层级，也不提供跨 Root 的层级保证。

## 6. Theme Context Bridge

v2 继续使用现有 `ThemeContext`、`ResolvedTheme`、`TsukiProvider` 和 `ConfigProvider`。目前 `TsukiProvider` 从 scheme 与根 ThemeConfig 解析主题，`ConfigProvider` 基于父 `ResolvedTheme` 进行合并。Overlay 不创建第二套 Theme 系统或新的 public ThemeProvider。

### Declarative Component Composition

具体组件可以采用 compound API 设计：

```tsx
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title />
      <Dialog.Description />
      <Dialog.Close />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

`Dialog.Root` 管理组件自身的 open state，支持 controlled (`open` / `onOpenChange`) 与 uncontrolled (`defaultOpen`) 两种模式。Trigger 请求打开；Portal 把内容交给私有 Registry；Overlay 管理遮罩；Content 管理内容布局和 Accessibility；Title、Description、Close 提供各自语义。组件 Root Context 必须显式桥接到 Host 中的 Entry。此示例不新增通用 public Portal API，也不规定本批次的组件 public contract。

Batch 16B.3 已加入私有 `OverlayPortal`。它接收受控 `visible`、`backBehavior`、可选 `onBack`、`transition`、`mask` 和 children；自身不创建业务 open state，不决定遮罩样式、Content 布局、Safe Area 或 Keyboard 行为，也不进入 package root exports。首次 `visible=true` 时，它从当前位置的 Overlay Runtime Context 解析 Root Registry，并通过 commit 阶段的 layout effect 创建 Entry；后续 props 更新使用同一 ID。首次 `visible=false` 不创建 Entry。

关闭时 Portal 只把现有 Entry 更新为 `exiting`，保持内容、Mask 和 React key，等待 Host 的 Mask / Content Transition 完成。退出完成后 Registry 删除 Entry；若 Portal 仍挂载且之后再次显示，旧 ID 的更新会失败并被回收，随后创建新 Entry。退出中重开则更新原 Entry，保留 ID，并由 generation 拒绝旧完成回调。真实卸载使用本地生命周期 lease 延迟清理一个 microtask，使 StrictMode 的同步 cleanup/setup 重放可重新取得同一 Entry；真正失去所有者后会幂等卸载 Entry。

Portal 捕获当前 `ResolvedTheme` 与 theme scope，沿用现有 Theme Bridge。任意业务 Context 不会自动跨越 Host；组件必须像 Dialog Root 一样将所需 Provider 显式放入 Portal children。Portal 不订阅完整 Registry Entry Snapshot。

### Imperative Controller Boundary

内部 controller 可以提供 `controller.open(config)` 并返回 `{ close(), update(nextConfig) }` 句柄。实际 public API 由具体组件设计阶段决定。

- 私有 `useOverlayController()` 默认绑定 Hook 所在的 Root Registry，并捕获调用位置的 `ResolvedTheme` 与 Theme scope；显式传入 `'root'` 时，Controller 使用该 Root 的根 Theme。`'root'` Controller 适合在树内取得后交给外部服务，服务调用始终绑定原 Root，不读取调用者的业务 Context。
- Hook owner 卸载后不再接受新的 `open()`；该 owner 创建的活动 Entry 进入正常退出动画，旧 Handle 的 `update()` / `close()` 返回 `false`。StrictMode 同步 Effect 重放由 lease 保留同一 owner；Root 永久销毁时 Registry 直接失效。
- `open()` 创建新的可见 Entry 并返回带稳定 ID 的 Handle。`update()` 不包含 `visible`，因此保留 Entry ID、React key 和层级位置；Entry 退出中仍可更新内容，但更新不会重新打开它。退出完成或 Root dispose 后，旧 Handle 不能修改 Entry。
- 首次 `close()` 通过 Registry 设置 `visible=false`，复用现有 Mask / Content Transition 和 generation 完成路径；Entry 完成退出后才卸载。重复关闭、已卸载 Entry 的关闭和更新均返回 `false`。再次打开需要新的 `open()`，不会复活旧 Handle。
- `backBehavior='dismiss'` 必须提供 `onBack`，并复用 Host 当前统一 Back 分发；Controller 不注册独立 BackHandler。
- 不创建每 Entry 独立 React Root，不使用模块级 active renderer，也不让 Registry 猜测调用者 ThemeContext。

### 声明式调用

```tsx
<ConfigProvider theme={customTheme}>
  <SomeComponent />
</ConfigProvider>
```

从该作用域挂载的浮层必须使用调用位置解析出的 `ResolvedTheme`。内部 Theme Context Bridge 在 Host 渲染 Entry 时恢复该 ThemeContext；源 `ConfigProvider` 更新时，已挂载 Entry 也要收到更新后的主题，不能永久使用初次挂载的过期快照。

### 命令式调用

组件树内外的 Registry 归属规则见 [Registry Resolution for Imperative Calls](#registry-resolution-for-imperative-calls)。树内入口显式捕获调用位置的 `ResolvedTheme`；树外入口必须绑定到一个确定的 Root controller，并使用该 Root 的根主题。任何路径都不得从 Registry 推断调用者的 React Context，也不改变现有 `ConfigProvider` 的合并行为。

## 7. Lifecycle

Host 与 Root 的生命周期分开管理：

```text
Host lifecycle
registerHost
    ↓
Host mounted
    ↓
unregisterHost
    ↓
Host temporarily unavailable
    ↓
registerHost (idempotent; restore existing Entry order)

Root lifecycle
Root created
    ↓
Registry created
    ↓
Host registered
    ↓
Root active
    ↓
Root permanently disposed
```

- `unregisterHost` 只注销 Host；它不清空 Registry 中已挂载或待渲染的 Entry。重新注册后恢复原有挂载顺序。
- Root Registry 属于该 Root，不是模块级全局实例。只有 Root 永久销毁时，才释放所有 Entry、关闭回调、订阅和 Root 级引用。
- React StrictMode 的 Effect cleanup/setup replay 不能永久销毁 Registry。Host 的普通 Effect cleanup 只执行 `unregisterHost`，后续 setup 必须可以幂等地重新注册并恢复 Entry。
- 若实现显式 `disposeRoot`，它不得与普通 Host cleanup 绑定。若其调用路径可能经历 StrictMode replay，必须确保 setup replay 能恢复 Root Registry；否则只能在确认 Root 永久销毁的边界调用。

```text
registered / mount
  ↓
entering
  ↓
entered (visible)
  ↓
exiting (still registered and rendered)
  ↓
Registry.unmount
```

- Registry membership 与 Entry presentation phase 分开管理。Entry 在 entering、entered 和 exiting 期间仍属于 Registry；退出时仍参与绘制和层级排序。
- `OverlayEntry` 以 `hidden`、`entering`、`entered`、`exiting` 表达 presentation phase，并带有递增 generation。关闭请求进入 `exiting`；重新打开进入 `entering` 并保留同一 Entry ID/React key。旧 generation 的完成通知不改变当前 Entry。
- 组件拥有打开、关闭和受控状态语义；Motion Runtime 执行进入和退出动画；Registry 只呈现 Entry 并管理其生命周期。
- 声明式 Portal 的 Entry 创建和更新发生在 React commit 阶段。Portal owner 的卸载清理使用可被 StrictMode replay 重新取得的本地 lease；普通隐藏仍由 Transition completion 结束，而不把退出等同于组件卸载。
- Imperative Controller 的 Hook owner 使用同样的 StrictMode-safe lease。最终卸载时，owner 让自己创建且尚未退出的 Entry 进入 `exiting`，而不是立即卸载；由 Host 的正常双通道完成通知释放 Entry。Root dispose 是清空 Registry 的最终边界。
- 关闭请求进入 `exiting` 后，Entry 继续挂载。内部 `OverlayEntryTransition` 为 Mask 和 Content 创建独立的现有 MotionValue 通道；所有实际参与退出的通道成功完成后才通知 Registry 卸载。没有动画的通道不阻塞协调；Reduced Motion 或零时长完成也必须通知。不得用固定 Timeout 替代动画完成通知。
- `update` 不创建新 Entry、不重置层级顺序，也不重复触发打开生命周期。
- 重复 close / `unmount` 不产生额外回调或异常；卸载后旧句柄不能更新已删除的 Entry。若 exiting Entry 重新打开，保留 ID/key 并使过期的 exit 回调失效。
- exiting 顶层 Entry 在完成卸载前仍是 Back 分发目标；Back 不得穿透到其下方 Entry。
- Registry 不持有动画 SharedValue、不运行 Motion primitive，也不决定业务关闭是否可被取消。

## 8. Layer Ordering

- 同一 Host 内按 Entry 的挂载顺序建立唯一且明确的渲染层级；后挂载的 Entry 位于先挂载的 Entry 上方。
- `update` 保留原有顺序；`unmount` 释放该顺序位置。
- Toast、Dialog、Popup 等类别不预设互相独立的全局优先级；Registry 不按业务类别重排 Entry。
- 层级顺序同时约束视觉绘制、触摸命中和顶层 Accessibility 管理。
- 不保证控制其他 React Root、React Native Modal、独立原生 Window 或应用外系统界面的层级。

## 9. Android / HarmonyOS Back

Android 和 HarmonyOS 的原生事件接入由统一的内部 Back 适配接口转交给当前 Root 的 Registry：

```text
Back Event
    ↓
Host-level Back Adapter
    ↓
OverlayRegistry.dispatchBack()
    ↓
只检查最顶层可见 Entry
    ↓
按该 Entry 的 backBehavior 处理；不向下扫描
```

- 每次 Back 只交给按层级排序的最顶层可见 Entry；不得跳过它去关闭底层 Entry。一次 Back 最多触发一个关闭回调。
- `passthrough` 不处理当前 Back 并交给导航或系统，不得继续向下扫描。没有可见 Entry 时也交给导航或系统。
- 不允许每个 Popup 或其他浮层独立注册 Back 监听并重复响应同一事件。
- Android 与 HarmonyOS 遵循同一 Registry 合约；各自的原生事件订阅留在平台适配层，具体 API 在 Batch 16B 验证。
- iOS 不需要模拟 Android Back 行为。

```ts
type OverlayBackBehavior = 'dismiss' | 'consume' | 'passthrough'
```

| 行为 | 处理 |
| --- | --- |
| `dismiss` | 调用当前 Entry 明确提供的关闭回调，并消费 Back。没有关闭回调的 Entry 不得声明 `dismiss`。 |
| `consume` | 消费 Back，但不调用关闭回调，也不关闭 Entry。 |
| `passthrough` | 不处理当前 Back，交给导航或系统；不检查任何底层 Entry。 |

未来共享组件 contract 应集中声明各组件语义的默认 `backBehavior`，组件不得各自发明不一致的隐式默认值。仅当 Back 在该组件中语义上等同于关闭时选择 `dismiss`；组件需要阻止导航但不可关闭时选择 `consume`；不拥有 Back 的非模态浮层选择 `passthrough`。具体组件可以显式覆盖默认值，但必须记录语义原因。

## 10. Pointer Events 与触摸

- Host 根容器采用 `pointerEvents="box-none"` 或等效策略，使未被浮层占用的区域仍可到达底层页面。
- 普通浮层只接收其内容所需的触摸。需要阻止底层点击的遮罩必须有独立、明确的命中区域。
- 非模态或无遮罩浮层不得因全屏 Host 包装层阻断无关区域。
- 多层叠加时，顶层 Entry 先参与命中测试；它未覆盖的区域按设计继续交给下一层或底层页面。
- 每个平台都要验证遮罩拦截、内容响应、穿透区域和叠层优先级。不能以 Host 根节点拦截全部触摸作为默认策略。

## 11. Safe Area / Keyboard

- Host 提供应用 React Root 坐标系内的挂载区域，不统一添加 Safe Area inset。
- Popup、Dialog、ActionSheet 等具体组件按自身布局和位置决定 Safe Area 行为。
- Keyboard 避让与输入焦点协调由具体浮层组件和现有应用键盘策略负责；Host 不接管全局 Keyboard 生命周期。
- 锚点测量、锚点定位、滚动锁和可用空间计算属于具体浮层能力，不属于 Registry。
- Host 的 View 层不能越过独立原生呈现层；需要独立系统窗口时由对应特殊功能自行选择原生能力。

## 12. Accessibility

- 浮层内容保留自身的 accessibility role、label、state、action 和可访问名称。
- 模态与非模态是组件语义。模态浮层必须定义其遮罩、底层内容可访问性隔离和顶层焦点需求；非模态浮层不得自动隐藏整页内容。
- 顶层浮层获得符合其语义的 Accessibility 优先级。焦点进入、焦点恢复和平台差异由 Runtime 与组件共同实现，不能由 Registry 代替组件决定。
- 遮罩与面板是独立的 Accessibility 边界；遮罩是否可访问、是否可触发关闭由组件 contract 决定。
- VoiceOver、Android Accessibility/TalkBack 和 HarmonyOS Accessibility 分别验收，模拟测试不能替代设备验证。

Batch 16B.5 在每个根 `TsukiProvider` 的页面子树上设置私有 Accessibility boundary；`OverlayHost` 保持为其同级节点。最高层有效 modal 决定隔离边界；退出完成前继续隔离页面和下层 modal。边界上方的 non-modal Entry 保持可访问；只有 non-modal Entry 时不隔离页面。初始和返回焦点使用业务元素提供的 ref，并在目标布局就绪、屏幕阅读器启用且 Entry generation 有效时发送原生 focus 事件。该 Runtime 与 `OverlayPortal`、`useOverlayController()` 共用 Registry 规则，不增加公共 export。Android TalkBack 的设备验收状态见 [Batch 16B.5 完成报告](./tsuki-v2-16b-5-completion-report.md)。

## 13. React Native Modal 对比与适用边界

| 方案 | 适用点 | 本架构中的边界 |
| --- | --- | --- |
| App-level OverlayHost + React Native View | 多浮层共享同一 Root、按序更新与卸载、沿用同一 Theme 运行时。 | 只管理该 Root 的 View 层级，不控制独立原生呈现层。 |
| `react-native-screens` `FullWindowOverlay` | iOS 可选的 UIWindow 层级包装，适合验证普通 View Host 被导航原生层级遮挡的场景。 | Batch 16B.0 前不是必选依赖或 Host 决策；它不提供 Registry、Root 隔离或 Context Bridge。其 Accessibility 容器默认是 modal，必须验证共享 Host 的非模态 Entry 行为。 |
| React Native `Modal` | 特殊功能确实需要平台管理的模态呈现或独立原生窗口时。 | 不作为 Toast、Dialog、Popup 等通用浮层基础；其原生呈现层级不由 OverlayRegistry 排序。 |
| `react-native-teleport` / 平台 Portal API | 不作为 v2 通用 Runtime 依赖。 | 不新增 Teleport 运行时依赖，不复制 v1 Portal 实现；平台差异不得改变统一 Host 合约。 |

`react-native-teleport` 可以留在 v1 归档和历史实验中；本决策不要求删除现有开发依赖。需要独立原生 Window 的功能可以单独使用 Native Modal，但不承诺与普通 Host Entry 互相控制层级。

## 14. 三端兼容性要求

| 平台 | 统一要求 | 平台适配与验收 |
| --- | --- | --- |
| iOS | 使用同一 Root 内的 React Native View Host 作为基线；如 16B.0 证据支持，可验证 FullWindowOverlay 原生层包装。 | 不注册 Android Back 行为；验证 View/FullWindowOverlay 层级、Safe Area、键盘、遮罩命中、VoiceOver、焦点与模态/非模态隔离。FullWindowOverlay 的 accessibility modal 默认值必须明确处理。 |
| Android | 使用同一 Host 和 Registry；Back 只由顶层适配入口分发一次。 | 验证 Back 与导航协作、遮罩命中、键盘、Safe Area、TalkBack 和原生绘制层级。 |
| HarmonyOS | 使用同一 Host 和 Registry 合约，不依赖平台专有 Portal。 | 在实际 RNOH 宿主验证 Back 事件适配、触摸与层级、键盘、Safe Area 和 Accessibility；不得从 Android 通过推断兼容性。 |

平台差异保留在 Host/Back 适配层，不在每个浮层组件中复制平台分支。View Host 不代表自动获得三端运行时兼容；每个平台仍需独立设备验收。

## 15. Batch 16B 实施路线

| Batch | 范围 | 交付与验收重点 |
| --- | --- | --- |
| 16B.0 | iOS Host Layer 验证 | 在实际导航栈比较 View 与 FullWindowOverlay；验证 UIWindow 层级、触摸、VoiceOver modal 行为、呈现边界、多窗口和依赖影响。证据不足以要求 FWO 时保留 View。 |
| 16B.1 | Registry、Entry、订阅与生命周期 | 每 Root 隔离；稳定 ID/key；Entry 顺序；删除中间 Entry 后保留其他组件状态；幂等卸载与退出完成回调。 |
| 16B.2 | Host、根 Provider 与 Theme Bridge | 导航后的稳定 Host；StrictMode-safe 注册/注销；根 Theme 与嵌套 ConfigProvider 更新；View 触摸穿透。 |
| 16B.3 | 内部声明式 Portal primitive | 经 Registry 挂载和更新；显式桥接组件 Root Context；不新增 generic public Portal。 |
| 16B.4 | Root-bound imperative controller | Root 显式绑定、update/close 句柄、树内 Theme 捕获以及缺少 Root 时明确失败。 |
| 16B.5 | Back、Accessibility 与 Motion 协作 | 顶层 Back；焦点进入和恢复；逐 Entry 的模态语义；Reduced Motion 下进入/退出完成通知；不通过 Timeout 卸载。 |
| 16B.6 | Overlay Lab 与三端验收 | 叠层、触摸穿透、状态保持、主题更新、生命周期、Back、VoiceOver/TalkBack/HarmonyOS Accessibility、导航和平台边界。 |

Batch 16A.2 的路线表保留了当时的分阶段计划。Batch 16B 已按本轮实施范围落地基础 Registry、Host、Theme Bridge、Back 适配、Accessibility Runtime 与 Playground Lab；具体自动化和设备验收结果应以对应交付记录为准。Batch 16B.5 的 TalkBack 线性导航与激活验收尚未全部确认，因此该批次保持 Pending。后续组件迁移和公共 API 设计仍需单独审查。设备和 package 验证记录实际平台与结果，不以静态检查代替运行验收。

### Batch 16B Transition Runtime

- 私有实现位于 `packages/tsuki/src/overlay/transition/`，只由 Overlay Host 与内部组件使用，不从 package root 导出。
- `MOTION_PRESETS` 定义透明度、缩放和位移端点；`useMotionValue` 负责 Timing、Spring、动画取消/接管及 Reduced Motion。Overlay 层只协调 Mask / Content 两个进度值，不创建第二套动画引擎。
- Host 为每个稳定 Entry Key 渲染同一个 Transition wrapper。Mask 可省略；若其存在但没有 Mask 动画配置，则静态显示且不阻塞完成。当前 generic Entry 默认使用 Content Fade，Dialog、Popup、ActionSheet、Toast、Loading 的内部方向映射集中在 `OVERLAY_TRANSITION_PRESETS`。
- 进度调试只在 10% 档位变化时通过 Worklets 调回 RN；实际位移帧仍由 SharedValue 和 `useAnimatedStyle` 驱动。
- Lab 入口为 Interaction Lab → Overlay → Transitions。调试面板观察 Entry ID、Presentation Phase、Mask / Content Progress、Animation Type / Generation、Completion Status 和 Registry Entry Count。

## 16. Batch 16A 决策阶段明确不做的内容

- 在 Batch 16A 决策阶段不创建 `packages/tsuki/src/overlay/`，不实现 Host、Registry、BackHandler 或 Bridge 源码；该阶段已结束，Batch 16B 的实现状态见本决策状态和上文 Host Ownership。
- 不把 react-native-screens FullWindowOverlay 设为强制依赖；先完成 16B.0 的 iOS 验证。
- 不新增 Overlay、Portal、Popup、Toast、Dialog 或 ActionSheet 公共 API。
- 不修改 `packages/tsuki/src/index.ts`、package exports、依赖、lockfile、Consumer、Playground、Fixture 或 Changeset。
- 不新增 `react-native-teleport` 作为 v2 Runtime 依赖，不把 React Native `Modal` 作为通用 Host。
- 不把 Toast、Dialog、Popup 的业务语义、动画、Safe Area、Keyboard 或锚点定位放入 Registry。
- 不新增全局万能 OverlayManager、新的 ThemeProvider，或对任意业务 React Context 的自动继承承诺。
- 不承诺控制 Native Modal、其他 React Root 或独立原生 Window 的层级。
