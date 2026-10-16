---
title: Picker 选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Picker 选择器

<section className="component-doc-intro">

## 介绍

Picker 是纯滚轮选择器，负责列数据、选中值、吸附动画和 Toolbar 操作。它不会自动创建 Popup；需要弹层时由调用方组合 `Cell` 和 `Popup`。

</section>

<code src="../../../src/picker/__fixtures__/overview.tsx" title="组件预览" description="Picker 汇总 Cell + Popup 组合、Toolbar、单列、多列、级联、Loading、空数据和 FieldPicker 联动示例。"></code>

## 引入

```tsx | pure
import { Cell, Picker, PickerToolbar, Popup, showPicker } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/picker/__fixtures__/examples/basic.tsx" title="Cell + Popup" description="由 Cell 打开底部 Popup，Picker 只负责滚轮选择和确认。"></code>

<code src="../../../src/picker/__fixtures__/examples/loading.tsx" title="Loading" description="Loading 覆盖滚轮内容并暂时禁止列交互，同时保留面板高度和 Toolbar。"></code>

<code src="../../../src/picker/__fixtures__/examples/empty.tsx" title="暂无数据" description="将暂无数据作为 disabled option 展示，不扩展 Picker 的空状态 API。"></code>

<code src="../../../src/picker/__fixtures__/examples/long-list.tsx" title="长列表 Picker" description="验证长列表的首尾居中、滚轮吸附和受控值更新。"></code>

<code src="../../../src/picker/__fixtures__/examples/multi-column.tsx" title="多列 Picker" description="同时渲染多个独立滚轮列。"></code>

<code src="../../../src/picker/__fixtures__/examples/safe-area.tsx" title="底部安全区" description="由 Popup 面板统一处理 bottom safe-area，并保持背景连续。"></code>

<code src="../../../src/picker/__fixtures__/examples/toolbar.tsx" title="PickerToolbar" description="独立使用 Toolbar，并复用统一的交互按钮。"></code>

<code src="../../../src/picker/__fixtures__/examples/linked.tsx" title="级联 Picker" description="父级变化后自动刷新并校正子级列。"></code>

<code src="../../../src/picker/__fixtures__/examples/field.tsx" title="FieldPicker 联动" description="FieldPicker 组合 Cell、Popup 与 Picker，确认后回写字段展示值。"></code>

<code src="../../../src/picker/__fixtures__/examples/item-height.tsx" title="自定义行高" description="Picker 支持自定义 itemHeight 和 visibleItemCount。"></code>

<code src="../../../src/picker/__fixtures__/examples/picker-view.tsx" title="无 Toolbar Picker" description="使用 showToolbar=false 渲染不带 Toolbar 的滚轮。"></code>

<code src="../../../src/picker/__fixtures__/examples/semantic.tsx" title="语义样式与空列" description="定制完整滚轮区域和独立操作样式；空列之后的选中值仍可正常回写。"></code>

## API

### PickerOption

```ts | pure
interface PickerOption {
  text: string
  value: string | number
  disabled?: boolean
  children?: readonly PickerOption[]
}
```

`text` 是显示文本，`value` 是规范化和提交值，`disabled` 的 option 不可选，`children` 用于级联数据。`formatter` 或 `filter` 不属于基础 Picker API，而应由日期时间组件处理。

### PickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `PickerColumns` | — | 单列、多列或级联数据 |
| `columnLabels` | `readonly string[]` | — | 按列位置提供无障碍名称；名称与 option 文本一起读出 |
| `value` | `readonly (string \| number)[]` | — | 受控选中值；未收到新的 prop 时，点击和手势不会改变最终选中状态 |
| `defaultValue` | `readonly (string \| number)[]` | — | 非受控初始值，只在初始化时使用 |
| `itemHeight` | `number` | 主题 token | 每个 option 的行高 |
| `visibleItemCount` | `number` | 主题 token | 滚轮视口显示的行数 |
| `virtual` | `boolean` | `true` | 长列按窗口渲染；`false` 全量渲染。短列及读屏器开启时全量渲染 |
| `loading` | `boolean` | `false` | 覆盖滚轮并禁止 option 的 tap/pan；不改变选中值，Toolbar 仍可操作 |
| `title` | `ReactNode` | — | Toolbar 中间标题 |
| `showToolbar` | `boolean` | `true` | 是否渲染 Toolbar；设置为 `false` 即为无 Toolbar Picker |
| `showToolbarDivider` | `boolean` | `false` | 是否显示 Toolbar 底部分隔线 |
| `confirmButtonText` | `ReactNode` | `'确定'` | 确认按钮内容 |
| `cancelButtonText` | `ReactNode` | `'取消'` | 取消按钮内容 |
| `swipeDuration` | `number` | 主题 token | 手势 / 惯性吸附时长 |
| `onChange` | `(values, options) => void` | — | tap 或 pan 最终吸附后调用一次；外部 value 更新不会触发 |
| `onConfirm` | `(values, options) => void` | — | Toolbar 确认回调，不重复触发 `onChange` |
| `onCancel` | `() => void` | — | Toolbar 取消回调；Popup 的关闭和 draft 回滚由调用方负责 |
| `style` | `StyleProp<ViewStyle>` | — | Picker 根 View 样式 |
| `styles` | `PickerStyles` | — | `root`、`toolbar`、`body`、`column`、`item`、`itemContent`、`mask`、`indicator`、`loading` 语义样式；支持对象或函数。 |

Picker 继承 React Native `ViewProps`，但不接受 `children` 和被组件接管的 `style`。弹层状态和关闭策略由 Popup 或业务组合层管理。

### 受控与非受控

受控 Picker 的显示值始终由 `value` 派生。用户请求新值后调用 `onChange`；如果父组件不回写，滚轮会恢复到当前受控值，回写后则停在新位置。确认会结算当前正在吸附的用户目标，但不会修改受控 `value`。非受控 Picker 使用 `defaultValue` 初始化，并在吸附完成后内部更新。

```tsx | pure
const [visible, setVisible] = useState(false)
const [committed, setCommitted] = useState<readonly PickerValue[]>(['beijing'])
const [draft, setDraft] = useState(committed)

<Cell
  title="城市"
  value={String(committed[0])}
  showArrow
  onPress={() => {
    setDraft(committed)
    setVisible(true)
  }}
/>
<Popup
  visible={visible}
  position="bottom"
  round
  closeOnPressOverlay
  safeAreaInsetBottom
  onRequestClose={() => setVisible(false)}
>
  <Picker
    columns={columns}
    value={draft}
    onChange={setDraft}
    onCancel={() => setVisible(false)}
    onConfirm={(nextValues) => {
      setCommitted(nextValues)
      setVisible(false)
    }}
  />
</Popup>
```

Picker 不维护 Popup 的 draft/commit 生命周期；上例中的 `draft`、`committed` 和关闭逻辑属于调用方。`columns={[]}` 时保留滚轮 frame，不渲染 option，确认结果是空数组；需要展示“暂无数据”时传入一个 disabled option。

多列中，空列和全 disabled 列不占用 `value`、`defaultValue`、回调 `values/options` 或列函数 `selectedValues/selectedOptions` 的位置。例如 `[[], cityOptions]` 的 `value` 为 `['hangzhou']`。`indexes` 和 `selectedIndexes` 始终按列位置返回，不可选列为 `-1`。所有列都不可选时，结果为 `values: []`、`options: []`。

### 语义样式

`style` 作用于根节点，优先级高于 `styles.root`。`styles` 函数接收当前 props 和规范化的 values、options、indexes。

| 槽位 | 作用区域 |
| --- | --- |
| `root` | 包含 Toolbar 和滚轮的根容器 |
| `toolbar` | 嵌套的 PickerToolbar 语义样式 |
| `body` | 完整滚轮区域，包含列、mask、indicator 和 Loading；padding/margin 会一起移动滚轮及覆盖层 |
| `column` | 每列的裁剪容器；统一作用于所有列 |
| `item` | option 的交互容器 |
| `itemContent` | option 文字 |
| `mask` | 上下渐隐遮罩 |
| `indicator` | 中央选中框 |
| `loading` | 中央 Loading 容器，不包含遮挡背景 |

行高由 `itemHeight` 控制；`styles.item.height` 不覆盖行高，避免文字排列与吸附位置错位。不要通过 item 的 margin、minHeight、maxHeight 或 flex 改变行距，也不要通过 column/mask/indicator 的尺寸覆盖滚轮几何。完整视口高度始终由 `itemHeight * visibleItemCount` 决定。自定义背景时，需同时配置 Picker 的 background 和 mask token，保持渐隐颜色一致。

### PickerToolbarProps

`PickerToolbar` 可独立使用，支持 `title`、`cancelButtonText`、`confirmButtonText`、`showDivider`、`onCancel`、`onConfirm`、`style`、`styles` 和 `testID`。Picker 的 `styles.toolbar` 使用同一结构。取消和确认按钮分别位于左右两侧，默认两侧等宽，标题在中间区域单行截断，不覆盖按钮。传入自定义 ReactNode 时，文字样式由该节点自己管理。

| 槽位                               | 作用区域                                           |
| ---------------------------------- | -------------------------------------------------- |
| `root`                             | Toolbar 根容器                                     |
| `titleContainer`                   | 中间标题容器                                       |
| `title`                            | 字符串或数字标题的文字                             |
| `cancel` / `confirm`               | 各自的操作按钮容器                                 |
| `cancelContent` / `confirmContent` | 各自的字符串或数字按钮文字                         |
| `item` / `itemContent`             | 保留的通用按钮容器和文字样式，先于各自操作样式应用 |

### 命令式 API

`showPicker(options)` 需要在 `TsukiProvider` 下调用，返回 `Promise<PickerResult>`；确认或取消后分别返回 `action: 'confirm'` 或 `action: 'cancel'`，并包含规范化的 `values` 和 `options`。命令式调用中的 `value` 和 `defaultValue` 都只用于初始化，后续 draft 由 adapter 自己维护。`Picker.open` 是 `showPicker` 的同义入口，`closePicker()` 以 cancel 结果结束当前命令式 Picker；如果 imperative host 被卸载，pending command 也按 cancel 结束。

命令式 `PickerOptions` 在 `PickerProps` 基础上允许配置 `overlay`、`closeOnPressOverlay`、`safeAreaInsetBottom` 和 `duration`，这些属性只由命令式 Popup adapter 消费，不会传给基础 Picker。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Picker` 覆盖 token：

| Token                                   | 默认来源               | 说明                       |
| --------------------------------------- | ---------------------- | -------------------------- |
| `picker_item_height`                    | `44`                   | 默认行高                   |
| `picker_text_color`                     | `colorText`            | 选项文字颜色               |
| `picker_toolbar_title_color`            | `colorText`            | Toolbar 标题文字颜色       |
| `picker_indicator_color`                | `colorBorderSecondary` | 选中框和 Toolbar 边框颜色  |
| `picker_toolbar_button_pressed_opacity` | `pressedOpacity`       | Toolbar 按钮按下时的透明度 |
| `picker_mask_color`                     | `colorBgContainer`     | 上下渐隐遮罩颜色           |
| `picker_visible_item_count`             | `6`                    | 默认可见行数               |
| `picker_disabled_option_opacity`        | `0.3`                  | disabled option 的透明度   |
| `picker_indicator_horizontal_inset`     | `16`                   | indicator 水平内缩         |
| `picker_swipe_duration`                 | `1000`                 | 手势 / 惯性吸附动画时长    |

## 无障碍与平台说明

每列暴露 `radiogroup` 角色，滚轮 option 暴露 `radio` 角色和 selected/disabled 状态；可用 `columnLabels` 区分多列。Toolbar 操作暴露 `button` 角色。Loading 隐藏 option 的无障碍树并保留 progressbar，同时取消尚未结算的选项交互。读屏器开启时自动全量渲染，长列表的屏幕阅读器遍历体验需在目标设备确认。

`virtual` 默认开启。长列只挂载可视范围及上下缓冲选项，完整数据仍用于选值、联动和确认；`virtual={false}` 保留全量渲染。首次挂载长列时，选项等待原生读屏状态查询完成后再显示，查询失败回退全量渲染。DatePicker、DateTimePicker、TimePicker、Field 选择适配器及 `Picker.open()` 同样支持此配置。窗口随拖动和吸附的真实偏移更新；JS 线程长时间阻塞时仍可能出现补充节点延迟，原生高速滚动体验需在目标设备验证。

PickerColumn 使用 `Gesture.Pan`、SharedValue 和共享 Motion 吸附能力，遵循 `ConfigProvider` / `TsukiProvider` 的 enabled、reducedMotion 和 durationScale。点击默认 200ms，滑动采用 swipeDuration；关闭动画或减少动态效果时直接结算。iOS、Android 的实际 tap/pan 冲突、速度和视觉效果仍需在目标设备确认。
