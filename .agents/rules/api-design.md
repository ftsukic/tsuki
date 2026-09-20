# Public API 规则

## Contract 优先

- 在实现前设计并检查 public contract。读取实际 component type、implementation、component barrel、root export、文档和聚焦测试。
- internal refactor 必须保留现有 public prop、type、export 和用户可观察行为。Public API 变更需要明确范围和 compatibility handling。
- Public type 表达 consumer-facing semantic，而不是 private implementation structure。Component type 通常使用 component prefix，例如 `ButtonProps`、`PickerRef`、`DatePickerValue` 或 `PickerSemanticStyles`。

## Props 与 React Native 继承

- 同一语义复用已有命名：`value`、`defaultValue`、`onChange`、`visible`、`defaultVisible`、`onVisibleChange`、`disabled`、`loading`、`required`、`title`、`description`、`placeholder`、`onConfirm`、`onCancel`、`minDate`、`maxDate`、`formatter` 和 `filter`。
- 不要为同一概念引入多个 public name，例如 `confirmText` 和 `okText`。如果 native 或 lower-level name 与 library contract 不同，应在内部 adapter，不要泄漏到上层 API。
- 当 component 是 native control 时，继承并保留相关 React Native props。应说明哪些 inherited prop 被支持、覆盖或明确不支持，不要静默接受一个仿制 API。
- 当两者同时存在时，保持 public `style` contract 与 semantic `styles` 的区别：`style` 指向 component root；`styles` 按 component contract 指向命名的 semantic slot。

## State、事件与 accessibility

- 对 stateful control，必须明确 controlled 和 uncontrolled 行为，使用 `value`/`defaultValue` 或 `visible`/`defaultVisible`，并在两种模式下保持 callback 行为一致。
- Public boolean prop 使用自然的 state name，例如 `disabled`、`loading`、`visible`、`clickable`、`required`、`vertical`、`border`、`round`、`overlay`、`showToolbar` 和 `closeOnPressOverlay`。除非已有 public contract 另有规定，`isXxx` 和 `hasXxx` 用于 internal derived value。
- Public callback 使用 `onXxx`（`onChange`、`onPress`、`onConfirm`、`onCancel`、`onOpen`、`onClose`、`onVisibleChange`）。Internal event function 使用 `handleXxx`；不得将其暴露为 public prop。
- Public component 必须保留或定义有意义的 React Native accessibility semantic，包括 platform 支持的 role、state、label 和 action。不要为了简化 internal implementation 而牺牲 accessibility behavior。

## Ref 与 compound API

- Public imperative ref type 使用 `FooRef`，方法使用明确的 action，例如 `open()`、`close()`、`confirm()`、`cancel()`、`focus()` 和 `blur()`。
- 当 compound component 和 static member 被 export 时，它们属于 public contract。保持其名称和行为稳定，并单独记录 Group 或相关 API。
- 不得仅为了让另一个 component 更容易构建或测试而暴露 internal ref、context、state machine 或 implementation-only component。

## Compatibility

- 组件 barrel 和 `src/index.ts` 中现有的 export 都是兼容面。它们的存在不代表未来 API design 应继续采用同样模式。
- 如果不可避免地调整 public API，应使用 `deprecated -> compatibility adapter -> major-version removal` 的顺序，并提供明确文档和聚焦回归覆盖。不要让 internal refactor 意外破坏 consumer。
