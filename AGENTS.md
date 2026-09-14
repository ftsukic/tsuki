# AGENTS.md

## 组件文档

- 组件文档统一参照 `docs/components/button/index.md` 的结构和交互形式。
- 组件文档 frontmatter 使用 `componentDoc: true` 和 `toc: false`，通过 `component-doc-intro` 写介绍，并提供一个 `overview.tsx` 作为“组件预览”。
- 所有公开用法都要写出可运行示例。至少覆盖基础用法、每个视觉变体、尺寸/布局、交互状态、禁用/加载/错误边界、组合组件和主题/语义样式；组件实际没有的类别不需要虚构示例。
- 每种用法放在 `__fixtures__/examples/*.tsx`，文件必须包含 `@title` 和 `@description`。`overview.tsx` 只负责按分类组合这些示例，避免在 MDX 中维护第二份实现。
- Markdown 的“代码演示”按功能逐项使用 `<code src="..." title="..." description="..."></code>` 引用 fixture；不要只放一段无法运行的代码来代替交互示例。
- API 文档必须说明公开类型、Props、默认值、行为边界、继承的 React Native Props、无障碍语义、`style`/`styles` 作用范围、主题 token 和明确不支持的 API。Compound component 的 Group/API 要单独说明。
- 示例应真实反映当前导出的 API，并展示状态变化或结果；新增 fixture 后同步更新文档的 `overview`、代码演示和 `docs/tsconfig.json`。
- 组件文档完成后至少运行 UI 包 typecheck、相关测试和 `docs:build`，并保持源码、fixture、文档三者的单一来源。

## 组件库命名规范

### 基本原则

- `src/<component>/` 目录本身就是组件命名空间，目录内文件不要机械重复组件名。
- 文件名统一使用 `kebab-case`，不要新增 PascalCase 或 camelCase 文件名。
- React 导出组件使用 `PascalCase`。
- 函数、变量、Hook 使用 `camelCase`；Hook 必须以 `use` 开头。
- 类型、接口使用 `PascalCase`。
- 模块级常量使用 `UPPER_SNAKE_CASE`。
- 新代码必须遵守本规范。
- 修改已有组件体系时，应收敛当前组件目录内明显不一致的命名；不要借机无关地批量重命名整个仓库。

### 组件目录

公共组件目录使用组件名称的 `kebab-case`。

例如：

    src/date-picker/
    src/date-time-picker/
    src/date-time-picker/
    src/floating-panel/
    src/image-preview/

对应公共组件：

    DatePicker
    DateTimePicker
    DateTimePicker
    FloatingPanel
    ImagePreview

不要使用：

    src/DatePicker/
    src/datePicker/
    src/date_picker/

### 主组件文件

组件主文件使用组件名称的 `kebab-case`。

例如：

    button/button.tsx
    date-picker/date-picker.tsx
    time-picker/time-picker.tsx
    floating-panel/floating-panel.tsx

对应组件：

    Button
    DatePicker
    TimePicker
    FloatingPanel

不要新增：

    Picker.tsx
    TimePicker.tsx
    FloatingPanel.tsx

### 子组件文件

同一目录内存在明确语义的 React 子组件时，文件名保留完整组件语义，并使用 `kebab-case`。

例如：

    picker/picker-view.tsx
    picker/picker-column.tsx
    picker/picker-toolbar.tsx

    field/field-input.tsx
    field/field-picker.tsx
    field/field-radio.tsx

    navbar/navbar-action.tsx

对应：

    PickerView
    PickerColumn
    PickerToolbar

    FieldInput
    FieldPicker
    FieldRadio

    NavbarAction

不要把明确的 React 子组件简写成：

    view.tsx
    column.tsx
    toolbar.tsx
    action.tsx

原则：

React 组件文件保留完整组件语义；目录级辅助文件使用短职责名。

### 辅助文件

组件目录已经提供命名空间，因此非组件辅助文件统一使用短职责名。

推荐：

    types.ts
    style.ts
    token.ts
    utils.ts
    context.ts
    state.ts
    value.ts
    columns.ts
    normalize.ts
    imperative.ts
    imperative.tsx

例如：

    src/date-time-picker/
      date-time-picker.tsx
      index.ts
      types.ts
      utils.ts
      style.ts

不要新增：

    date-time-picker.types.ts
    date-time-picker.utils.ts
    date-time-picker.style.ts

同一个组件体系内不要混用：

    interface.ts
    types.ts

或者：

    style.ts
    styles.ts

新组件和重构后的组件统一优先：

    types.ts
    style.ts

### Hook 文件

Hook 文件统一使用：

    use-<purpose>.ts
    use-<purpose>.tsx

例如：

    use-picker.ts
    use-field-value.ts
    use-input-value.ts
    use-input-auto-size.ts
    use-image-preview-loader.ts

对应导出：

    usePicker
    useFieldValue
    useInputValue
    useInputAutoSize
    useImagePreviewLoader

不要新增：

    usePicker.ts
    useFieldValue.ts
    useInputAutoSize.ts

### 内部领域模块

多个组件共享一套内部领域能力时，应放到最合适的基础组件或内部模块下，不要因为出现一个内部概念就自动创建新的公共组件。

例如 Picker 内部共享的年月日时分秒计算：

    src/picker/
      date-time/
        columns.ts
        types.ts
        value.ts

内部领域模块应满足：

- 表达真实职责。
- 不从根 `src/index.ts` 导出。
- 不因为只有几个文件就强制创建 `index.ts`。
- 不把内部实现泄漏成公共 API。
- 上层组件通过明确内部路径复用。

### Core 命名

不要把 `Core` 当作“复杂代码放这里”的默认命名。

只有同时满足以下条件时，才允许创建：

    <component>-core.tsx

条件：

- 它是真正独立的 React 组件。
- 可以脱离外层组件单独使用。
- 有清晰、稳定的输入输出契约。
- 存在多个真实调用方。
- 不是单纯做 props 转换、value 转换或再包装一层组件。

如果只是：

    状态计算
    value 转换
    columns 生成
    normalization
    adapter

优先使用：

    utils.ts
    value.ts
    columns.ts
    state.ts
    normalize.ts
    use-*.ts

不要仅为内部实现创建：

    FooCore
    FooCoreRef
    FooCoreProps
    FooCoreState

### 类型命名

公共组件类型使用组件名前缀。

例如：

    ButtonProps

    PickerProps
    PickerRef
    PickerValue

    DatePickerProps
    DatePickerRef
    DatePickerType

    DateTimePickerProps
    DateTimePickerRef
    DateTimePickerValue

    PickerSemanticStyles
    PickerStyleState

目录内部的纯实现类型，在上下文不会产生歧义时可以使用领域名称，不需要机械重复组件名称。

公共类型必须表达业务语义，不要暴露内部实现结构。

### Props 命名

优先沿用 React 和组件库已有约定：

    value
    defaultValue
    onChange

    visible
    defaultVisible
    onVisibleChange

    disabled
    loading
    required

    title
    description
    placeholder

    onConfirm
    onCancel

    minDate
    maxDate

    formatter
    filter

同一个组件族中，同一语义必须统一命名。

不要同时出现多个表达同一概念的公共 prop，例如：

    confirmText
    confirmButtonText
    okText

底层组件命名与上层公共 API 不一致时，在内部做 adapter，不要把底层实现命名泄漏到上层 API。

### Boolean 命名

公共 boolean prop 优先使用自然状态：

    disabled
    loading
    visible
    clickable
    required
    vertical
    border
    round
    overlay
    showToolbar
    closeOnPressOverlay

不要无意义地增加：

    isDisabled
    isLoading
    isVisible

`isXxx`、`hasXxx` 更适合作为内部派生变量。

例如：

    const isControlled = value !== undefined
    const hasSelection = values.length > 0

### Callback 命名

公共事件回调使用：

    onChange
    onPress
    onConfirm
    onCancel
    onOpen
    onClose
    onVisibleChange

内部事件函数使用：

    handleChange
    handlePress
    handleConfirm
    handleCancel

不要把 `handleXxx` 暴露为公共 prop。

### Ref 命名

公共 imperative ref 类型使用：

    FooRef

例如：

    DatePickerRef
    DateTimePickerRef

方法使用明确动作：

    open()
    close()
    confirm()
    cancel()
    focus()
    blur()

不要为了内部传递创建没有实际抽象意义的：

    FooCoreRef
    FooInnerRef
    FooInternalRef

### Style 命名

组件样式文件统一：

    style.ts

不要新增：

    styles.ts

公共 semantic style 类型使用：

    FooSemanticStyles
    FooStyleState
    FooStyles

semantic slot 使用 UI 语义：

    root
    container
    header
    content
    label
    value
    indicator
    toolbar

避免：

    wrapper1
    leftBox
    innerView
    content2

### Token 命名

存在独立组件主题 token 时使用：

    token.ts

只有组件确实存在独立可配置视觉变量时才创建 `token.ts`。

不要为了目录结构完整创建空 token 文件。

### Utils 命名

`utils.ts` 只放纯函数或稳定 helper。

函数名表达明确行为，例如：

    normalizeDateRange
    clampDate
    formatValue
    resolveColumns

避免：

    process
    handle
    transformData
    helper
    doSomething

当逻辑已经形成明确领域概念时，拆成：

    columns.ts
    value.ts
    state.ts
    normalize.ts

不要把所有内部逻辑堆进 `utils.ts`。

### Index 导出

每个公共组件目录使用：

    index.ts

`index.ts` 只负责公共 API export，不放实现逻辑。

例如：

    export { DatePicker } from './date-picker'

    export type {
      DatePickerProps,
      DatePickerRef,
      DatePickerType,
    } from './types'

不要从 `index.ts` 暴露仅供内部使用的：

    internal state helper
    columns generator
    internal hook
    normalization implementation
    private context
    无实际公共用途的 Core component

根：

    src/index.ts

只导出正式公共 API。

### Import 规则

组件内部优先引用真实文件。

例如：

    import type { PickerProps } from '../picker/types'
    import { Picker } from '../picker'
    import { createDateTimeColumns } from '../picker/date-time/columns'

私有实现不要为了方便先 export 到公共 `index.ts`，再通过 barrel 反向 import。

避免：

    internal file
    → component index
    → internal file

形成循环依赖。

### 测试文件

集中测试放在：

    src/__tests__/

组件测试：

    button.test.tsx
    picker.test.tsx
    date-picker.test.tsx
    date-time-picker.test.tsx

纯逻辑测试：

    picker-date-time.test.ts
    image-preview-utils.test.ts

测试围绕公共行为和重要领域行为。

不要为了方便测试而永久保留没有设计价值的内部组件或公共 API。

### Fixture

组件 fixture：

    src/<component>/__fixtures__/
      overview.tsx
      examples/
        basic.tsx
        controlled.tsx
        disabled.tsx
        custom.tsx

fixture 文件名描述场景，不重复组件名称：

    basic.tsx
    controlled.tsx
    bounds.tsx
    formatter.tsx

不要：

    date-picker-basic.tsx
    date-picker-controlled.tsx

### 文档

组件文档目录和组件目录保持一致：

    docs/components/date-picker/index.md
    docs/components/date-time-picker/index.md
    docs/components/floating-panel/index.md

### 推荐目录结构

单组件：

    src/search/
      __fixtures__/
      search.tsx
      index.ts
      types.ts
      style.ts
      token.ts

包含子组件：

    src/picker/
      __fixtures__/
      picker.tsx
      picker-view.tsx
      picker-column.tsx
      picker-toolbar.tsx
      imperative.tsx
      index.ts
      types.ts
      style.ts
      token.ts
      use-picker.ts

组件族：

    src/field/
      __fixtures__/
      field-input.tsx
      field-picker.tsx
      field-radio.tsx
      field-checkbox.tsx
      field-switch.tsx
      feedback.tsx
      index.ts
      types.ts
      style.ts
      use-field-value.ts

内部共享领域：

    src/picker/
      date-time/
        columns.ts
        types.ts
        value.ts

### 禁止新增的命名模式

新代码不要新增：

    PascalCase.tsx
    camelCase.ts
    *.types.ts
    *.utils.ts
    *.style.ts
    styles.ts
    useSomething.ts

统一使用：

    kebab-case.tsx
    kebab-case.ts
    types.ts
    utils.ts
    style.ts
    use-something.ts

### 核心判断规则

目录负责回答“这是谁的代码”，文件名负责回答“它做什么”。

React 组件文件保留完整组件语义：

    date-picker.tsx
    picker-view.tsx
    field-input.tsx

目录级支撑文件使用短职责名：

    types.ts
    style.ts
    token.ts
    utils.ts
    value.ts
    columns.ts
    use-picker.ts

新增文件前必须先判断它是“React 组件”还是“组件目录内的支撑能力”，不要混用两套命名方式。
