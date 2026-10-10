# Gesture 与 Pressable 分阶段重构计划

日期：2026-10-10。状态：阶段 1–5 的源码、API 与 canonical Fixture 已完成；阶段 6 已完成静态与构建验证，原生设备验收未执行。

范围更新：按用户要求，本轮不处理 Dumi 文档、构建或网页 adapter。第五阶段仅执行 canonical Fixture 与 Expo 示例。

本计划以当前工作区源码为基线，不将未提交的 Motion、Example 或其他组件改动回退。此前的类型拆分和距离 helper 提取属于结构准备，不代表生命周期重构完成。

## 目标与范围

- Gesture 负责识别、UI thread 位移更新、释放决策与终止清理。
- Interaction 负责按压事实、原生事件、点击节流与交互协调。
- Pressable 负责背景、覆盖层、透明度和缩放反馈。
- Motion 负责动画策略、preset 和驱动；MotionPressable 保留为现有兼容入口。
- canonical Fixture 描述真实能力，Dumi 与 Expo 复用；预览不支持的能力明确说明。

不删除或重命名现有 public export，不迁移 FloatingPanel 的 PanResponder，不新增多吸附点、拖拽排序、二维拖动或受控 Swipe，不引入新依赖。不提交、不发布。

## 阶段 1：契约盘点（已完成）

| 契约 | 当前事实 | 本轮处理原则 |
| --- | --- | --- |
| Pan 名称 | root `usePanGesture` 属于 Interaction；RNGH 为 `useGesturePan` | 保留，示例明确入口差异 |
| Pan 回调 | worklet 内直接调用 onStart/onChange/onEnd | 保留线程语义，补 worklet 要求；RN 通知另行增量设计 |
| Pan 结束 | onEnd 在自动回弹之前调用；success=false 不回弹 | 保留成功路径顺序；取消修复单独记录为行为变化 |
| Swipe 边界 | 两侧均可拖动；target 由 direction 与 snapPoint 决定 | 保留反向拖动，不静默改为单向限制 |
| Swipe progress | abs(translateX)/maxDistance，截断到 1 | 保留分母；打开不一定等于 1，文档明确 |
| Swipe 阈值 | maxDistance × threshold；速度可以覆盖距离决策 | 保留并覆盖边界测试 |
| Swipe disabled | 禁用识别，open/close 仍可程序化调用 | 保留 |
| Pressable 样式 | background: root style → 颜色 → pressedStyle；overlay: 默认裁剪 → root style，layer 上 pressedStyle 最后 | 保留 |
| 动画样式 | 当前测试断言用户 root style 可覆盖反馈；真实 Reanimated 样式优先级仍需验证 | 不能仅按数组顺序声称跨平台等价，先复现再固定实现 |
| pressedStyle | 仅 background/overlay 消费 | 保留，修正文案 |
| 按压节流 | onPressDebounceWait 是前沿时间窗口抑制 | 保留名字与行为，说明其并非尾沿 debounce |
| 原生能力 | long press、hitSlop、retention、accessibility 等已继承 | 核查转发并补覆盖，不重复造 API |
| 兼容入口 | InteractionPressable、usePressAnimation、MotionPressable 已存在 | 保留，内部不增加并列状态机 |

已确认的缺口：取消后位置无统一收尾；新拖动未显式取消吸附；pressed 计算在 style/children/反馈之间不一致；视觉桥接经 effect；Tap 数量没有处理 NaN/Infinity；Gesture 返回类型过宽；gesture 测试主要是挂载；Dumi Gesture adapter 不执行手势回调。

需要复现的疑点：原生打断时跳变、斜向拖动与 ScrollView 竞争、按压反馈时序、动态切换反馈 host、实际 Reanimated 与用户 style 的覆盖关系。不得将这些疑点报告为已确认的设备故障。

## 阶段 2：Gesture 生命周期（已实现）

修改范围：`src/gesture/`、聚焦 Gesture tests；仅当业务边界需要时触及 `src/motion/gesture.ts`。

1. 拖动进入 active 后，先取消当前轴动画，再记录起点。
2. 将释放决策与终止清理解耦，使用 finalize 做兜底，确保每次收尾只有一次。未激活失败不启动多余回弹。
3. 拟定行为修复：Pan 激活后取消且 springBack=true 时回零；false 时保留位移。Swipe 激活后取消恢复拖动前的稳定目标，首次默认为关闭。
4. 明确 enabled/方向/范围变化的收尾：禁用按取消处理；方向变更清理旧轴；范围缩小时约束有效位移和目标。保持程序化 open/close 可用。
5. 对 Tap 数量做有限正整数归一化；保留成功后 RN 回调与 finalize 清除 pressed。
6. 收窄返回 gesture 到 RNGH 具体类型，编译验证组合 API；不新增自制组合层。

验收：开始、成功结束、取消、失败、反复拖动、动画中再次拖动、动态禁用、NaN/Infinity、左右 Swipe 的速度与阈值均有聚焦覆盖。旧 export 与原有成功路径保持兼容。

## 阶段 3：Interaction 与 Pressable（已实现）

修改范围：`src/interaction/interaction-pressable-internal.tsx`、`src/pressable/`、相关 tests；不重写 Interaction PanResponder。

1. 统一内部 pressed/hovered/disabled 解析，style、children、视觉反馈消费相同状态。
2. 区分内部同步视觉通知与历史兼容通知。内部控制器从按压事件启动反馈；配置、disabled、testOnly_pressed 与卸载仍有同步与清理路径。
3. 保留原生事件顺序、交互协调、点击节流和 ref；不将 Pressable 改为 Tap Gesture。
4. 先验证动态 pressStyle 切换，再决定是否需要稳定 host。不要仅为减少组件数量强行合并。
5. 核查实际 animated style 优先级；背景、覆盖层、transform 与 opacity 分别处理。任何样式行为变化必须有明确测试和记录。
6. pressedStyle 文案限定静态反馈范围，删除无作用的内部转发包装，公共兼容入口保留。

验收：disabled、长按、press in/out、取消、快速按放、函数 style/children 一致、背景/覆盖层顺序、圆角、ref、节流、accessibility 与旧兼容回调均保持正确。

## 阶段 4：Motion 策略与增量事件（已实现）

先完成阶段 2–3，避免在状态不稳定时增加 API。

- 明确 durationScale 对 spring 的实际语义，并在 Motion 层实现；保留局部关闭、全局关闭和 Reduced Motion 的立即目标反馈。
- 拟新增最小 RN 通知：Pan 最终结果，Swipe 稳定打开状态。不要逐帧调度 React 更新。
- 区分请求、释放、到达目标、取消；旧动画完成回调不得覆盖新目标。优先通过一个稳定结果事件表达，避免堆叠重叠回调。
- API 编码前，在本计划补齐名称、参数、线程、触发时机、重复调用和取消规则；发布行为变更按 release Rule 添加 changeset。

验收：Motion 开关和倍率覆盖 timing/spring；事件只报告最新目标；程序化与手势路径共用完成语义；旧调用方无需修改。

## 阶段 5：canonical Fixture 与 Expo 示例（已实现）

读取 document-component Skill 与 Fixture generator 后实施。

| Fixture 场景 | 可观察结果                                                    |
| ------------ | ------------------------------------------------------------- |
| Pan 基础     | 轴向、边界、回弹与保留位置，useAnimatedStyle 内读取数值       |
| Pan 中断     | 动画中再次拖动、禁用、取消，显示最终状态                      |
| Swipe        | 左右方向、maxDistance 与 snapPoint 不同、open/close、稳定结果 |
| Tap          | 单击/双击、成功计数、取消后 pressed 复位                      |
| Press 反馈   | 五种反馈、函数 children/style、pressedStyle 作用范围          |
| Press 边界   | 长按、禁用、节流、移出再进入、快速按放                        |
| Motion 策略  | 本地/全局关闭、Reduced Motion、倍率；仍保留视觉反馈           |
| 嵌套滚动     | ScrollView 内的拖动与点击竞争                                 |

Expo 复用 canonical Fixture，catalog 通过脚本生成。底层 Pan + Reanimated 示例明确为引擎能力，不宣称受 Tsuki Motion 策略控制。Dumi 不支持 Gesture 交互时给出清楚说明；Pressable 网页反馈优先复用已有预览驱动，不在每个组件复制 RAF。

## 阶段 6：验证与交付（静态验证完成，设备验收待执行）

每个代码阶段执行 package typecheck、相关聚焦测试与局部 lint；public API 变更增加 build/export 检查。Fixture 阶段增加 Example validation；本轮按用户要求跳过 Dumi。最后按 `.github/workflows/ci.yml` 执行适用质量门禁，不以局部检查代替全部通过。

设备验收覆盖 iOS/Android 的拖动打断、取消、嵌套滚动和按压；Harmony 需要真实宿主与设备证据。未执行项目明确列为未验证。

执行前重新确认 typecheck 基线。上轮标准 typecheck 曾被 Example 的 `@/fixtures/*` 路径错误阻塞，发布源码 typecheck 通过；历史结果不能代替本次运行。

每阶段交付：实际修改路径、兼容/行为变化、示例可观察结果、运行命令与结果、剩余问题。维护本文件阶段状态；只有完成对应验收才标记完成。

## 本轮交付记录

- Pan 新增 `onFinalize(event: PanGestureFinalizeEvent)`：RN 线程释放/取消快照，不等待回弹结束；仅激活的手势发出一次，卸载后不回调。旧 onStart/onChange/onEnd 仍为 worklet。
- Swipe 新增 `onOpenChange(open: boolean)`：最新吸附目标完成后在 RN 线程通知，初始关闭不通知，重复状态去重；过期或卸载后的完成事件忽略。取消恢复拖动前已完成的稳定目标。
- Gesture 返回具体 PanGesture/TapGesture 类型，支持 RNGH 原生组合配置；方向、目标和范围变化会终止当前拖动，不让新的吸附与旧拖动竞争。
- Interaction 状态提取至 private Hook。Pressable 统一 Animated host，避免切换反馈卸载原生 host/内容；内部视觉通知同步执行，旧 compatibility 通知保留 post-commit 行为。统一 host 会让静态反馈也使用动画 host，设备开销尚未测量。
- 用户 opacity/transform 在 animated style 内解析；曾动画过的属性切换后显式清理，静态反馈初始不增加无效属性。
- spring 倍率通过 damping/scale、stiffness/scale² 保持阻尼比；MotionValue、按压和手势吸附使用同一策略。SwipeCell 跟随共享策略，不重写其交互逻辑。
- 新增 Pan 中断、Swipe、Tap、嵌套滚动和 Pressable 事件边界 Fixture，Expo catalog 由 generator 更新。底层引擎示例明确其策略边界。
- 新增 minor changeset；未修改版本、提交或发布。

实际验证：完整 Jest 执行结果为 68 套件通过、898 项测试通过；FixtureExplorer 套件在导入现有 Expo Router 时因 Expo ESM 转换配置失败，未进入测试。该入口已有 Router 重构，测试仍匹配旧 Explorer，未在本任务改动。

package build（含发布源码声明检查）、本次变更 ESLint、Example typecheck、Example config 与 Expo Web export 通过。标准 package typecheck 仍报当前 FixtureExplorer 的 `@/fixtures/*` 路径解析错误，与执行前基线一致。package build 另有既有 commonjs/exports 配置警告。

额外运行 `release:check-package` 未通过：`npm pack` 的 prepare/Husky 日志混入 JSON 输出，现有校验脚本解析失败；未修改发布脚本。

未执行：Dumi、原生构建/设备交互、Harmony 宿主验收。Web export 与 Mock 测试不能替代原生验收。

## 2026-10-10 Pressable 归属收敛

本阶段取代上述按压 API 兼容策略：删除 `InteractionPressable`、`useInteractionPress` 和按压专属旧类型，不提供适配。使用 `Pressable`、`PressableProps` 与 `PressableState`。唯一按压 Hook、点击抑制与 animated host 归入 `src/pressable/`，旧 effect 通知桥接删除。现有反馈控制器与样式行为保留。

Interaction 当前仅保留协调和 responder；`interactionId` 与 SwipeCell 协调链路暂时保留，Gesture 入口不变。验证结果以本次实际执行记录为准。

## 2026-10-10 SwipeCell 协调收敛

删除 InteractionCoordinator、useInteraction 及其协调类型，移除 Pressable 和 SwipeCellAction 的 interactionId。Provider 仅提供 SwipeCellManager；Pressable 使用 SwipeCell 私有按压协调 Hook，内容与操作区提供归属，Portal 和 Popover 浮层清除归属。保留 Group、无 Provider 和嵌套 Provider 的既有范围，以及公开 useSwipeCellController。Interaction 仅剩 responder，尚未迁移 Gesture。

## 2026-10-10 Interaction 模块移除

本节为上述分阶段历史记录的最终 API 状态：src/interaction 已删除。FloatingPanel 使用 src/gesture/useResponderPanGesture 的私有 responder，轴向识别、激活条件与释放/终止回调保持原样，未改用 RNGH。

公共 usePanGesture 统一为 RNGH：使用 direction 而非 axis，返回 gesture、translateX、translateY、progress 而非 panHandlers。删除 useGesturePan、GesturePanOptions、GesturePanResult 与 responder 专属类型；公共参数和返回类型统一为 UsePanGestureOptions / UsePanGestureResult。

```tsx | pure
import { usePanGesture } from '@ftsukic/tsuki'
import type { UsePanGestureOptions, UsePanGestureResult } from '@ftsukic/tsuki'

const options: UsePanGestureOptions = { direction: 'horizontal', maxDistance: 120 }
const pan: UsePanGestureResult = usePanGesture(options)
// 将 pan.gesture 传给 GestureDetector；位移值用于 useAnimatedStyle。
```

Pressable、SwipeCell 和 Gesture 分别拥有按压、协调与手势能力，无兼容入口。源码、测试和构建验证不代表原生设备验收。
