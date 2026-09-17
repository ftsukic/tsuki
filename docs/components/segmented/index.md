---
title: Segmented 分段控制器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Segmented 分段控制器

<section className="component-doc-intro">

## 介绍

Segmented 是互斥选择型分段控制器，适合通知已读状态、筛选条件和页面模式。它使用统一的 `InteractionPressable` 点击反馈，并通过滑动 thumb 表示选中状态。

</section>

<code src="../../../src/segmented/__fixtures__/overview.tsx" title="组件预览" description="Segmented 的通知、筛选、尺寸、布局、形状和禁用用法。"></code>

## 引入

```tsx | pure
import { Segmented } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/segmented/__fixtures__/examples/notice.tsx" title="未读 / 已读通知" description="用 Segmented 实现通知状态切换。"></code>

<code src="../../../src/segmented/__fixtures__/examples/filter.tsx" title="筛选示例" description="展示字符串 option、对象 option、size 和 block。"></code>

<code src="../../../src/segmented/__fixtures__/examples/disabled.tsx" title="禁用状态" description="整体禁用和单项禁用都不会触发 onChange。"></code>

<code src="../../../src/segmented/__fixtures__/examples/custom-label.tsx" title="自定义标签" description="option 的 label 支持自定义 ReactNode。"></code>

<code src="../../../src/segmented/__fixtures__/examples/shapes.tsx" title="形状与自定义圆角" description="对比 default、round 和单实例自定义圆角。"></code>

<code src="../../../src/segmented/__fixtures__/examples/theme.tsx" title="主题与语义样式" description="通过组件 token、单实例选中颜色和 styles 定制胶囊控件。"></code>

## API

### SegmentedProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | `readonly (string \| SegmentedOption)[]` | — | 分段选项；字符串同时作为 label 和 value |
| value | `string \| number` | — | 受控激活值 |
| defaultValue | `string \| number` | 第一个可用 option | 非受控初始激活值 |
| onChange | `(value: string \| number) => void` | — | 激活值变化时触发；重复点击当前项不会触发 |
| shape | `'default' \| 'round'` | `'default'` | `default` 使用默认圆角；`round` 让外层容器和 selected thumb 使用胶囊圆角，option 本身不设置圆角 |
| borderRadius | `number` | — | 当前实例的外层容器、selected thumb 和 pressed feedback 圆角；优先级高于 `shape` |
| size | `'small' \| 'middle' \| 'large'` | `'middle'` | 控件尺寸 |
| block | `boolean` | `false` | 占满父级宽度，并让各 option 等分 |
| disabled | `boolean` | `false` | 禁用整个控件并覆盖 option 状态 |
| selectedTextColor | `string` | — | 仅覆盖当前实例选中 option 的文字颜色；禁用 option 仍使用 `disabledColor` |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `SegmentedStyles` | — | `root`、`option`、`label`、`selectedBackground` 语义样式 |

### SegmentedOption

```ts
interface SegmentedOption {
  label: ReactNode
  value: string | number
  disabled?: boolean
}
```

字符串 option 等价于 `{ label: option, value: option }`。对象 option 的 `value` 应保持唯一；`label` 可以是自定义 ReactNode。

根节点默认角色为 `radiogroup`，每个 option 使用 `radio` 角色并同步 `selected` 和 `disabled` 状态。每个完整 option 都是 `InteractionPressable` 点击区域，不只文本可点击。

`value` 无匹配项时不会自动修正，也不会触发回调。未传 `value` 或 `defaultValue` 时选中第一个可用 option；所有 option 都禁用时仍展示列表，但没有可用的切换行为。

## 语义样式

```tsx | pure
<Segmented
  options={['全部', '未读', '已读']}
  styles={({ state }) => ({
    root: { marginBottom: state.block ? 16 : 8 },
    label: { fontWeight: state.value === '未读' ? '600' : '400' },
  })}
/
```

`style` 和 `styles.root` 作用于根节点；`styles.option` 作用于每个完整点击项；`styles.label` 作用于文本 label；`styles.selectedBackground` 作用于动画 thumb。自定义 label 的内部样式由调用方控制。

`shape="default"` 使用 Button 的 `borderRadius`，`shape="round"` 使用 `borderRadiusRound`；传入 `borderRadius` 后，当前实例的外层容器、selected thumb 和 pressed feedback 统一使用该值，并优先于 `shape`。`style={{ borderRadius }}` 只描述根节点，不会作为内部圆角来源。`block` 会让 option 等分可用宽度。

## 主题定制

默认 track 背景使用 `colorFillTertiary`，selected thumb 使用 `colorBgContainer`，选中文字使用 `colorText`。如需只覆盖当前实例的选中文字颜色，可直接传入 `selectedTextColor`；如需统一调整多个实例，可通过 `ConfigProvider` 的 `theme.components.Segmented` 覆盖组件 token：

```tsx | pure
<Segmented defaultValue="list" selectedTextColor="#1677ff" options={['list', 'board']} />
```

| Token                   | 默认来源                  | 说明                       |
| ----------------------- | ------------------------- | -------------------------- |
| selectedBackgroundColor | `colorBgContainer`        | selected thumb 颜色        |
| selectedTextColor       | `colorText`               | 选中文字颜色               |
| pressedBackgroundColor  | `colorBgContainerPressed` | 未选中 option 按下背景     |
| backgroundColor         | `colorFillTertiary`       | track 背景颜色             |
| borderColor             | `colorBorder`             | track 边框颜色             |
| borderWidth             | `lineWidth`               | track 边框宽度             |
| disabledColor           | `colorTextDisabled`       | 禁用文字颜色               |
| animationDuration       | `motionDurationMid`       | thumb 的位置和宽度动画时长 |
| padding                 | `paddingXXS`              | track 内间距               |
| fontFamily              | `fontFamily`              | option label 字体          |

尺寸和排版不在 Segmented 中重复定义，复用 `Button` token 的 `height`、`paddingHorizontal` 和字体；未选中 option 按下时使用 `pressedBackgroundColor`，按压层的 `borderRadius` 与 selected thumb 保持一致，`round` 形态始终保持胶囊轮廓。已选项不再叠加第二层按压面。

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      Segmented: {
        selectedBackgroundColor: '#e6f4ff',
        selectedTextColor: '#0958d9',
        pressedBackgroundColor: '#f2f3f5',
      },
    },
  }}
>
  <Segmented options={['列表', '看板']} defaultValue="列表" />
</ConfigProvider>
```

组件不提供多选、路由绑定、Web 专属 HTML 属性或独立动画库；业务内容由调用方根据 `value` 自行渲染。
