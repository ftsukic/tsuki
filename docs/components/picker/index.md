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

Picker 用于从一个或多个滚轮列中选择值，提供 Vant 风格的 Toolbar、确认/取消操作、吸附和级联列。滚动过程只更新滚轮位置，停稳后才提交选中 index 和 `onChange`；PickerView 是不包含 Popup 和 Toolbar 的纯滚轮版本。

</section>

<code src="../../../src/picker/__fixtures__/overview.tsx" title="组件预览" description="Picker 汇总弹层、Toolbar、单列、多列、级联、FieldPicker 联动和纯滚轮示例。"></code>

## 引入

```tsx | pure
import { Picker, PickerToolbar, PickerView, showPicker } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/picker/__fixtures__/examples/default-popup.tsx" title="默认 Picker Popup" description="由 Picker 自动挂载底部 Popup，Toolbar 和滚轮作为一个面板同步进出动画。"></code>

<code src="../../../src/picker/__fixtures__/examples/basic.tsx" title="基础弹层" description="使用 visible 控制 Popup，确认后提交选中的值。"></code>

<code src="../../../src/picker/__fixtures__/examples/long-list.tsx" title="长列表 Picker" description="验证长列表的首尾居中、滚轮吸附和受控值更新。"></code>

<code src="../../../src/picker/__fixtures__/examples/multi-column.tsx" title="多列 Picker" description="同时渲染多个独立滚轮列。"></code>

<code src="../../../src/picker/__fixtures__/examples/safe-area.tsx" title="底部安全区" description="由 Popup 面板统一处理 bottom safe-area，并保持背景连续。"></code>

<code src="../../../src/picker/__fixtures__/examples/toolbar.tsx" title="PickerToolbar" description="独立使用 Toolbar，并复用统一的交互按钮。"></code>

<code src="../../../src/picker/__fixtures__/examples/linked.tsx" title="级联 Picker" description="父级变化后自动刷新并校正子级列。"></code>

<code src="../../../src/picker/__fixtures__/examples/field.tsx" title="FieldPicker 联动" description="FieldPicker 直接组合 Cell 与 Picker，确认后回写字段展示值。"></code>

<code src="../../../src/picker/__fixtures__/examples/item-height.tsx" title="自定义行高" description="PickerView 支持自定义 itemHeight 和 visibleItemCount。"></code>

<code src="../../../src/picker/__fixtures__/examples/picker-view.tsx" title="PickerView" description="独立使用不带 Toolbar 的纯滚轮。"></code>

## API

### PickerOption

```ts | pure
interface PickerOption {
  text: string
  value: string | number
  children?: readonly PickerOption[]
}
```

`text` 是显示文本，`value` 是提交值。`children` 用于级联数据；不支持在组件内部修改传入的 options。

### PickerViewProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `PickerColumns` | — | 单列、多列或包含 `children` 的级联数据；也支持由前置选择计算列数据的函数列 |
| `value` | `readonly (string \| number)[]` | — | 受控选中值，数组顺序对应列顺序 |
| `defaultValue` | `readonly (string \| number)[]` | — | 非受控初始值；非法值回退到当前列第一项 |
| `onChange` | `(values, options) => void` | — | 列完成 momentum 吸附后触发，返回规范化 value 和对应的选中 options |
| `itemHeight` | `number` | `44` | 单行高度；小于 `1` 会被校正 |
| `visibleItemCount` | `number` | `5` | 可见行数；偶数会调整为下一个奇数 |
| `style` | `StyleProp<ViewStyle>` | — | PickerView 根节点样式 |
| `styles` | `PickerViewStyles` | — | `root`、`columns`、`column`、`item`、`itemLabel`、`mask`、`indicator` 语义样式 |

PickerView 使用原生 `Animated.ScrollView`、`snapToInterval` 和 `onMomentumScrollEnd` 处理快速滑动及吸附。顶部和底部 padding 会根据 `visibleItemCount` 保证第一项和最后一项能够居中；中间 indicator、上下渐隐遮罩以及文字的 opacity、scale、translateY 会随滚动位置变化。

函数列接收 `PickerColumnContext`，其中包含前置列的 `selectedValues`、`selectedIndexes`、`selectedOptions`、`values` 和 `indexes`。

### PickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `PickerColumns` | — | PickerView 的列或级联数据 |
| `value` | `readonly (string \| number)[]` | — | 外部已提交值；Picker 打开时以此初始化 draft |
| `defaultValue` | `readonly (string \| number)[]` | — | 非受控初始值 |
| `title` | `ReactNode` | — | Toolbar 中间标题 |
| `showToolbar` | `boolean` | `true` | 是否渲染 Toolbar |
| `confirmButtonText` | `ReactNode` | `'确定'` | 确认按钮内容 |
| `cancelButtonText` | `ReactNode` | `'取消'` | 取消按钮内容 |
| `visible` | `boolean` | — | 传入后由 Picker 挂载底部 Popup；未传入时只渲染内嵌 Picker 内容，便于作为现有 Popup 的 children |
| `onChange` | `(values, options) => void` | — | 滚轮吸附后的 draft 变化 |
| `onConfirm` | `(values, options) => void` | — | 确认当前 draft，返回最终 value/options |
| `onCancel` | `() => void` | — | 丢弃 draft；调用方负责关闭受控 `visible` |
| `safeAreaInsetBottom` | `boolean` | `true` | 自动挂载的 bottom Popup 是否填充宿主提供的底部安全区；内嵌模式不生效 |
| `style` | `StyleProp<ViewStyle>` | — | Picker 内容根节点样式 |
| `styles` | `PickerStyles` | — | Picker 内容、Toolbar、按钮、滚轮和指示框语义样式 |

确认和取消由调用方关闭受控 Popup：

```tsx | pure
const [visible, setVisible] = useState(false)
const [value, setValue] = useState<readonly (string | number)[]>(['beijing'])

<Picker
  columns={columns}
  value={value}
  visible={visible}
  onCancel={() => setVisible(false)}
  onConfirm={(nextValue) => {
    setValue(nextValue)
    setVisible(false)
  }}
/>;
```

滚动期间 Picker 只维护 draft；取消不会改动外部 `value`。Picker 不实现输入框，Field、Cell 或其他触发控件应由调用方组合。

### PickerToolbarProps

`PickerToolbar` 可独立使用，支持 `title`、`cancelButtonText`、`confirmButtonText`、`onCancel` 和 `onConfirm`。取消和确认按钮统一使用 `InteractionPressable`，不提供 `TouchableOpacity` 或独立点击态 API。

### 命令式 API

`showPicker(options)` 需要在 `Provider` 下调用，返回 `Promise<PickerResult>`；确认或取消后分别返回 `action: 'confirm'` 或 `action: 'cancel'`，并包含规范化的 `values` 和 `options`。`Picker.open` 是 `showPicker` 的同义入口。`closePicker()` 只关闭当前命令式 Picker，不会解析 pending Promise。命令式 API 的 `options` 与 Picker props 相同，但不接受受控 `visible`。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Picker` 覆盖 token：

| Token                          | 默认来源               | 说明                      |
| ------------------------------ | ---------------------- | ------------------------- |
| `picker_item_height`           | `44`                   | 默认行高                  |
| `picker_text_color`            | `colorTextSecondary`   | 非选中项文字颜色          |
| `picker_active_text_color`     | `colorText`            | 选中项和操作按钮文字颜色  |
| `picker_indicator_color`       | `colorBorderSecondary` | 选中框和 Toolbar 边框颜色 |
| `picker_mask_color`            | `colorBgContainer`     | 上下渐隐遮罩颜色          |
| `picker_visible_item_count`    | `5`                    | 默认可见行数              |
| `picker_item_inactive_opacity` | `0.3`                  | 远离中心的文字透明度      |
| `picker_item_inactive_scale`   | `0.9`                  | 远离中心的文字缩放比例    |
| `picker_item_translate_y`      | `4`                    | 滚轮层次的最大垂直位移    |

其他字号、字体、背景、内边距和遮罩 stop opacity 也通过 Picker component token 控制；实现中不写死颜色。

## 无障碍与平台说明

滚轮项目暴露 `radio` 角色和 selected 状态，Toolbar 按钮暴露 `button` 角色。Popup 继续使用现有 Portal、Overlay 和 Animation，因此不在 Picker 中重复实现弹层。Jest 和 Web 构建覆盖结构及逻辑；iOS、Android 的实际手势速度和视觉效果仍需在目标设备截图验证。
