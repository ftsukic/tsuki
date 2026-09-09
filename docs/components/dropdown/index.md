---
title: Dropdown 下拉菜单
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Dropdown 下拉菜单

<section className="component-doc-intro">

## 介绍

Dropdown 用于在菜单栏下方或上方展开一个选项面板。它复用 Portal、OverlaySurface 和共享 motion 能力，支持 Vant 风格的 options、自定义内容、禁用状态、受控值、向上展开和 ref 控制。

</section>

<code src="../../../src/dropdown/__fixtures__/overview.tsx" title="组件预览" description="Dropdown 汇总基础、内容、禁用、方向和受控值示例。"></code>

## 引入

```tsx | pure
import { DropdownItem, DropdownMenu } from '@ftsukic/tsuki'
```

组件需要放在 `PortalHost` 或 `Provider` 内；应用已经提供 Portal 宿主时不需要为每个 Dropdown 额外添加宿主。

## 代码演示

<code src="../../../src/dropdown/__fixtures__/examples/basic.tsx" title="基础用法" description="使用 options 生成排序面板，并组合自定义筛选面板。"></code>

<code src="../../../src/dropdown/__fixtures__/examples/custom-content.tsx" title="自定义内容" description="children 存在时优先作为面板内容，并可以通过 DropdownItem ref 关闭。"></code>

<code src="../../../src/dropdown/__fixtures__/examples/disabled.tsx" title="禁用状态" description="展示禁用菜单和禁用选项。"></code>

<code src="../../../src/dropdown/__fixtures__/examples/direction-up.tsx" title="向上展开" description="使用 direction up 将面板锚定在菜单上方。"></code>

<code src="../../../src/dropdown/__fixtures__/examples/controlled.tsx" title="受控值" description="由外部状态控制 DropdownItem.value。"></code>

## API

### DropdownMenuProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 一个或多个 `DropdownItem`；菜单项等宽排列 |
| activeColor | `string` | `Dropdown.activeColor` | 当前展开菜单项和选中选项的颜色 |
| overlay | `boolean` | `true` | 是否渲染菜单区域之外的遮罩 |
| closeOnPressOverlay | `boolean` | `true` | 点击遮罩时关闭当前面板 |
| duration | `number` | `Dropdown.animationDuration` | 面板和箭头动画时长，单位为毫秒；主题关闭 motion 时为 0 |
| zIndex | `number` | `Dropdown.zIndex` | Portal 锚定层的基础层级；面板使用基础层级加 1 |
| direction | `'down' \| 'up'` | `'down'` | 面板相对菜单的展开方向，箭头方向同步变化 |
| swipeThreshold | `number` | `4` | 菜单项超过该数量时启用横向滚动容器 |
| style | `StyleProp<ViewStyle>` | — | 菜单栏根节点样式 |
| styles | `DropdownMenuStyles` | — | `root`、`item`、`title`、`arrow` 语义样式；resolver state 包含 `active`、`disabled`、`index` |
| onChange | `(index: number \| null) => void` | — | 展开、切换或关闭时通知当前菜单项索引 |

`DropdownMenu` 的打开状态是内部管理的，不提供 `openIndex` 或 `defaultOpenIndex`。菜单项切换时 active index 直接替换，面板和遮罩不会先完整关闭再重新挂载。

### DropdownItemProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 显式标题；优先级高于当前选项文本 |
| value | `string \| number` | — | 受控选项值；传入后内部不会覆盖 |
| defaultValue | `string \| number` | — | 非受控模式的初始选项值 |
| options | `DropdownOption[]` | — | options 面板；当前值对应的 `text` 会作为默认标题 |
| disabled | `boolean` | `false` | 禁用触发器和展开行为 |
| children | `ReactNode` | — | 自定义面板内容；同时传入 `children` 与 `options` 时 `children` 优先 |
| onChange | `(value: string \| number) => void` | — | 选择选项时回调；重复选择当前项也会回调，但不会重复写入非受控值 |
| onOpen | `() => void` | — | 该项开始展开时回调 |
| onOpened | `() => void` | — | 面板展开动画完成时回调 |
| onClose | `() => void` | — | 该项开始关闭时回调 |
| onClosed | `() => void` | — | 面板关闭动画完成并卸载后回调 |
| closeOnSelect | `boolean` | `true` | 选择 option 后是否关闭面板；自定义内容需要自行调用 ref 关闭 |
| style | `StyleProp<ViewStyle>` | — | 触发器根节点样式 |
| contentStyle | `StyleProp<ViewStyle>` | — | 当前面板根节点样式 |
| styles | `DropdownItemStyles` | — | `content`、`option`、`optionText`、`optionIcon`、`overlay` 语义样式 |
| testID | `string` | — | 触发器测试标识；options 行使用 `dropdown-option-{index}-{optionIndex}` 形式的内部标识 |

### DropdownOption

```tsx | pure
interface DropdownOption {
  text: ReactNode
  value: string | number
  disabled?: boolean
  icon?: ReactNode
}
```

禁用 option 不会触发 `onChange` 或关闭面板。`DropdownItem` 的触发器和 option 都使用 `accessibilityRole="button"`；触发器暴露 `expanded`/`disabled`，option 暴露 `selected`/`disabled`。

## Ref API

```tsx | pure
const menuRef = useRef<DropdownMenuRef>(null)
const itemRef = useRef<DropdownItemRef>(null)

menuRef.current?.open(0)
menuRef.current?.toggle(1)
menuRef.current?.close()

itemRef.current?.open()
itemRef.current?.toggle()
itemRef.current?.close()
```

ref 方法复用同一套 `DropdownMenu` 状态，不会创建第二套 visible 状态。

## 主题 Token

通过 `ConfigProvider` 的 `theme.components.Dropdown` 覆盖组件 token：

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      Dropdown: {
        activeColor: '#722ed1',
        menuHeight: 48,
      },
    },
  }}
>
  <DropdownMenu>...</DropdownMenu>
</ConfigProvider>
```

公开 token 包含 `menuHeight`、`menuBackgroundColor`、`titleColor`、`activeColor`、`disabledColor`、`titleFontSize`、`titleLineHeight`、`titleFontFamily`、`arrowSize`、`arrowGap`、`optionHeight`、`optionPaddingHorizontal`、`optionFontSize`、`optionLineHeight`、`optionIconSize`、`contentBackgroundColor`、`dividerColor`、`overlayColor`、`animationDuration` 和 `zIndex`。

组件不提供 Web DOM、`openIndex`、`defaultOpenIndex` 或第三方 popover/dropdown API；需要外部打开状态时使用 `DropdownMenuRef` 或由上层响应 `onChange`。
