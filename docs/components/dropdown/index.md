# Dropdown 下拉菜单

## 介绍

Dropdown 用于在菜单栏下方或上方展开一个选项面板。它复用 Portal、OverlaySurface 和共享 motion 能力，支持 Vant 风格的 options、自定义内容、禁用状态、受控值、向上展开和 ref 控制。

- [组件预览：Dropdown 汇总基础、内容、禁用、方向和受控值示例。](../../../src/dropdown/__fixtures__/overview.tsx)

## 引入

```tsx
import { DropdownItem, DropdownMenu, useBackgroundScrollLocked } from '@ftsukic/tsuki'
```

组件需要放在 TsukiProvider 内，并确保应用外层挂载 Teleport PortalProvider。

## 代码演示

- [基础用法：使用 options 生成排序面板，并组合自定义筛选面板。](../../../src/dropdown/__fixtures__/examples/basic.tsx)

- [自定义内容：children 存在时优先作为面板内容，并可以通过 DropdownItem ref 关闭。](../../../src/dropdown/__fixtures__/examples/custom-content.tsx)

- [禁用状态：展示禁用菜单和禁用选项。](../../../src/dropdown/__fixtures__/examples/disabled.tsx)

- [向上展开：使用 direction up 将面板锚定在菜单上方。](../../../src/dropdown/__fixtures__/examples/direction-up.tsx)

- [受控值：由外部状态控制 DropdownItem.value。](../../../src/dropdown/__fixtures__/examples/controlled.tsx)

- [语义样式：单项标题、箭头、面板、选项图标和选中标记，以及打开期间的动态更新。](../../../src/dropdown/__fixtures__/examples/semantic.tsx)

- [背景滚动锁定：锁定背景列表，同时保留长选项列表与横向菜单的滚动。](../../../src/dropdown/__fixtures__/examples/scroll-lock.tsx)

## API

### DropdownMenuProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 一个或多个 `DropdownItem`；菜单项等宽排列 |
| activeColor | `string` | `Dropdown.activeColor` | 当前展开菜单项的 title/caret、选中 option 文字和 selected check 的颜色 |
| overlay | `boolean` | `true` | 是否渲染菜单区域之外的遮罩 |
| closeOnPressOverlay | `boolean` | `true` | 点击遮罩时关闭当前面板 |
| duration | `number` | `Dropdown.animationDuration` | 面板和箭头动画时长，单位为毫秒；主题关闭 motion 时为 0 |
| zIndex | `number` | `Dropdown.zIndex` | Portal 锚定层的基础层级；面板使用基础层级加 1 |
| direction | `'down' \| 'up'` | `'down'` | 面板相对菜单的展开方向，箭头方向同步变化 |
| swipeThreshold | `number` | `4` | 菜单项超过该数量时启用横向滚动容器；触发器保持非收缩宽度 |
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
| options | `DropdownOption[]` | — | options 面板；当前值对应的 `text` 会作为默认标题；选项过多时限制在可用高度内并纵向滚动 |
| disabled | `boolean` | `false` | 禁用触发器和展开行为 |
| children | `ReactNode` | — | 自定义面板内容；同时传入 `children` 与 `options` 时 `children` 优先 |
| onChange | `(value: string \| number) => void` | — | 选择选项时回调；重复选择当前项也会回调，但不会重复写入非受控值 |
| onOpen | `() => void` | — | 该项开始展开时回调 |
| onOpened | `() => void` | — | 面板展开动画完成时回调 |
| onClose | `() => void` | — | 该项开始关闭时回调 |
| onClosed | `() => void` | — | 面板关闭动画完成并卸载后回调；切换到其他 item 时，在旧 item 不再作为面板内容后回调 |
| closeOnSelect | `boolean` | `true` | 选择 option 后是否关闭面板；自定义内容需要自行调用 ref 关闭 |
| style | `StyleProp<ViewStyle>` | — | 触发器根节点样式 |
| styles | `DropdownItemStyles` | — | `root`、`title`、`arrow`、`popup` 语义样式；支持对象或函数。 |
| testID | `string` | — | 触发器测试标识；options 行使用 `dropdown-option-{index}-{optionIndex}` 形式的内部标识 |

### DropdownOption

```tsx
interface DropdownOption {
  text: ReactNode
  value: string | number
  disabled?: boolean
  icon?: ReactNode
}
```

禁用 option 不会触发 `onChange` 或关闭面板。`DropdownItem` 的触发器和 option 都使用 `accessibilityRole="button"`；触发器暴露 `expanded`/`disabled`，option 暴露 `selected`/`disabled`。

DropdownItem 的 styles resolver 只描述触发器自身的 `active`、`disabled`、`index` 状态。option 的 `selected`、`pressed` 和 `disabled` 按每一行独立计算；`styles.popup.listItem` 与 `styles.popup.listItemLabel` 是静态样式覆盖，不会把所有 option 误判为 selected。

## 语义结构

| 区域                                   | 对应节点                                              |
| -------------------------------------- | ----------------------------------------------------- |
| `DropdownMenu.styles.root` / `style`   | 菜单栏根节点；`style` 优先                            |
| `DropdownMenu.styles.item/title/arrow` | 所有触发器的根节点、文本、箭头；resolver 按每一项解析 |
| `DropdownItem.styles.root` / `style`   | 单项触发器；菜单级样式、单项样式、`style` 依次覆盖    |
| `DropdownItem.styles.title/arrow`      | 单项标题、箭头，覆盖菜单级同名样式                    |
| `DropdownItem.styles.popup.root`       | 可见面板，包括自定义内容；不是 Portal 定位或裁剪节点  |
| `popup.list`                           | options 的 ScrollView                                 |
| `popup.listItem/listItemLabel`         | 可点击选项行、字符串或数字文本                        |
| `popup.listItemIcon`                   | 保留原有行为，同时作用于前置图标与选中勾              |
| `popup.listItemSelectedIcon`           | 选中勾的独立覆盖，在 `listItemIcon` 之后应用          |
| `popup.mask`                           | 可见遮罩；透明交互拦截层不接受该样式                  |

`title` 与 option 的 `text` 接受 ReactNode。字符串、数字应用文本 slot；自定义 ReactNode 保留自己的样式，不会被克隆或注入样式。面板高度由实际布局更新，包含换行、行高及面板 padding；options 列表在可用空间内滚动，自定义内容需要自行配置内部滚动容器。

## 背景滚动锁定

Dropdown 从开始打开到退出动画完成持续持有背景滚动锁；切换、关闭途中重开不会释放。`overlay={false}` 只隐藏可见遮罩，背景锁仍生效。完全关闭或卸载释放锁，同一 TsukiProvider 下的多个持有者全部释放后才恢复背景滚动。

Web 自动锁定菜单所在页面与可滚动祖先，保留原有 overflow 样式；面板内滚动和菜单横向滚动可用，列表边界不继续带动背景。背景祖先通过程序改变滚动位置时关闭菜单，避免旧锚点造成错位。Escape 关闭后恢复触发器焦点。

React Native 通过透明交互层阻断菜单之外的背景手势。宿主列表应在TsukiProvider **内部**使用 `useBackgroundScrollLocked()`，连接 `scrollEnabled`，停止背景列表自身的滚动能力；Portal 无法直接设置任意父列表的属性。

```tsx
function Page() {
  const locked = useBackgroundScrollLocked()
  return (
    <ScrollView scrollEnabled={!locked}>
      <DropdownMenu>...</DropdownMenu>
    </ScrollView>
  )
}
// <TsukiProvider><Page /></TsukiProvider>
```

已有 `scrollEnabled` 条件应保留，例如 `scrollEnabled={pageScrollEnabled && !locked}`。Hook 按 TsukiProvider 隔离；TsukiProvider 外返回 `false`。示例浏览器已接入背景锁。

退出、旧面板切换退出和透明测量期间的内容禁用交互并从读屏树隐藏；读屏关闭动作在关闭完成后恢复触发器的可访问焦点。锁定不会阻止调用方通过程序滚动原生列表；需要主动滚动时先调用 `close()`，再执行滚动。

## Ref API

```tsx
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

```tsx
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

公开 token 包含 `menuHeight`、`menuBackgroundColor`、`titleColor`、`activeColor`、`disabledColor`、`optionTextColor`、`optionDisabledColor`、`optionPressedBackgroundColor`、`titleFontSize`、`titleLineHeight`、`titleFontFamily`、`caretSize`、`caretGap`、`optionHeight`、`optionPaddingHorizontal`、`optionFontSize`、`optionLineHeight`、`optionIconSize`、`contentBackgroundColor`、`dividerColor`、`dividerWidth`、`shadowColor`、`shadowOpacity`、`shadowRadius`、`shadowOffset`、`elevation`、`overlayColor`、`animationDuration` 和 `zIndex`。`activeColor` 仍表示打开/选中状态，不是 pressed 反馈。

组件不提供 Web DOM、`openIndex`、`defaultOpenIndex` 或第三方 popover/dropdown API；需要外部打开状态时使用 `DropdownMenuRef` 或由上层响应 `onChange`。

## 动画

面板、遮罩和箭头使用统一 Motion 配置与浮层 preset，保留原有向上/向下展开和 item 切换语义。关闭期间保留面板；快速切换取消旧完成回调，遵循 `TsukiProvider motion`。
