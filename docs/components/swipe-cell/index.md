# SwipeCell 滑动单元格

拖动期间内容直接跟手，松手后由统一 Motion 使用临界阻尼弹簧承接速度，默认模式快速吸附且不来回弹跳；限位模式由单一动画进度驱动正文、action 和遮罩，正文只在打开末段叠加轻微回弹，关闭时三者同步平滑归位。默认模式下命令式 `open()` / `close()` 保留 timing 动画，时长由 `animationDuration` 和 Motion 时长倍率决定；该 token 同时缩放手势吸附速度。`overshoot` 默认 `false`；开启后超过 action 实测宽度的位移按 0.25 阻尼处理。松手结合实际显示位移、短时速度投影与方向速度阈值吸附，`onOpen` / `onClose` 在当前有效动画完成后触发。关闭 Motion 或开启 Reduced Motion 时即时吸附，拖动本身继续跟随手指。

## 介绍

SwipeCell 用于在列表行上通过水平滑动展示操作，提供 Vant 风格的左右多 action、吸附阈值、命令式控制和页面级单开协调。

- [组件预览：SwipeCell 的微信消息列表、多 action、协调、列表、分组和主题示例。](../../../src/swipe-cell/__fixtures__/overview.tsx)

## 引入

```tsx
import { SwipeCell, SwipeCellAction, SwipeCellGroup, useSwipeCellDismiss } from '@ftsukic/tsuki'
```

## 代码演示

示例页默认打开微信效果，通过顶部标签切换，每次只挂载一个示例。

| 场景 | 内容 |
| --- | --- |
| [微信效果](../../../src/swipe-cell/__fixtures__/examples/wechat.tsx) | 正文限位、action 撑开、文字遮挡，置顶、未读和删除 |
| [基础操作](../../../src/swipe-cell/__fixtures__/examples/basic.tsx) | 单个右侧 action 与操作结果 |
| [左右操作](../../../src/swipe-cell/__fixtures__/examples/both-sides.tsx) | 左右两侧独立配置 |
| [多个操作](../../../src/swipe-cell/__fixtures__/examples/multiple-actions.tsx) | 同侧多个 action |
| [点击与按住](../../../src/swipe-cell/__fixtures__/examples/content-close.tsx) | 收起时业务点击、长按计数；展开后仅关闭；拖动取消反馈 |
| [FlashList · 1000 条](../../../src/swipe-cell/__fixtures__/examples/flash-list.tsx) | 公共 SwipeCell + 页面 Hook，覆盖外部触摸、单开、滚动关闭与数据回收 |
| [FlatList 接入](../../../src/swipe-cell/__fixtures__/examples/list.tsx) | 同一套页面 Hook 接入 FlatList |
| [Ref 控制](../../../src/swipe-cell/__fixtures__/examples/ref.tsx) | 手动调用 open / close |
| [主题样式](../../../src/swipe-cell/__fixtures__/examples/theme.tsx) | action 颜色与宽度 |
| [页面单开](../../../src/swipe-cell/__fixtures__/examples/coordination.tsx) | 通过页面 Hook 管理多行 |
| [Group 协调](../../../src/swipe-cell/__fixtures__/examples/group.tsx) | SwipeCellGroup 内的兼容协调方式 |

## API

### SwipeCell

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| id | `string` | 自动生成 | 业务稳定 id；用于协调标识，列表复用时需重置或重建行内组件 |
| children | `ReactNode` | — | 行的主体内容；默认位于 action 层上方 |
| actions | `SwipeCellActionItem[]` | — | 微信消息列表风格的右侧 action 简写 |
| leftActions | `SwipeCellActionItem[]` | — | 从左侧滑入的多个 action；展开方向为向右 |
| rightActions | `SwipeCellActionItem[]` | — | 从右侧滑入的多个 action；展开方向为向左 |
| leftAction | `ReactNode` | — | 兼容旧用法的单个左侧 action；当 `leftActions` 已传入时忽略 |
| rightAction | `ReactNode` | — | 兼容旧用法的单个右侧 action；当 `rightActions` 已传入时忽略 |
| onLeftActionPress | `PressableProps['onPress']` | — | `leftAction` 不是 `SwipeCellAction` 时的点击回调 |
| onRightActionPress | `PressableProps['onPress']` | — | `rightAction` 不是 `SwipeCellAction` 时的点击回调 |
| closeOnActionPress | `boolean` | `true` | action 点击后是否自动关闭当前 cell |
| contentDragLimit | `number` | 不限制 | 主体完整展开时的最大平移距离（点）；主体与上层 action 按同一进度同步移动，负数按 0 处理，非有限值忽略 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于默认样式 |
| styles | `SwipeCellStyles` | — | root、content、contentOverlay、actions 语义样式；支持对象或函数 |
| ref | `SwipeCellRef` | — | 暴露 `open(side?)` 和 `close()` |
| onOpenStart | `() => void` | — | 水平手势激活或命令式打开时立即触发，用于提前登记操作行，不代表最终一定展开 |
| onOpen | `() => void` | — | action 完成展开后的回调 |
| onClose | `() => void` | — | action 完成关闭后的回调 |

SwipeCell 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。`open()` 默认展开右侧 action；如果右侧没有可测宽度，会回退到左侧 action。action 宽度由实际布局测量，慢速拖动结束时位移严格超过对应宽度的 50% 才展开，等于或低于 50% 则关闭；快速滑动优先按方向判断展开或关闭。

组件使用 Gesture Handler 的 `Gesture.Pan()` 处理水平拖动，主体通过 Reanimated `Animated.View` 的 `translateX` 移动；主体保持按住约 80ms 后才显示按压反馈，使用 SwipeCell 自己的 `pressedBackgroundColor`；横向滑动或纵向移动超过手势阈值时取消本次反馈，嵌套的库内 Cell / Pressable 同步恢复，业务 press 事件不因此延迟；自定义原生 Pressable 的内部样式仍由其自身管理，action pressed 时在原彩色背景上显示 `actionPressedOverlayColor`，不会整体变透明。关闭状态下没有可用 action 时不会响应滑动；`activeOffsetX` 和 `failOffsetY` 用于避免误抢纵向列表手势。展开后点击或长按主体只关闭当前 cell，不显示主体按压反馈，也不触发子 Cell / 库内 Pressable 的点击、长按业务事件；关闭后下一次触摸恢复正常交互。触摸开始不会关闭自身，继续拖动会从当前位移接管。手势松开使用携带速度的临界阻尼弹簧，默认模式的命令式开关保留 timing；关闭时 action 按打开路径反向收拢。手势取消后也会吸附到稳定位置。action 按标准宽度的比例随拖动撑开，各区域连续相接，外侧边缘固定；文字保持标准布局宽度和单行，关闭时由相邻 action 与行边界逐步遮挡；完整展开及超拉撑开时文字居中，文字与图标不缩放；右侧内容被上层 action 遮挡，不改变主体排版宽度。开启 `overshoot` 后，超过完整展开位置继续增加各 action 的可见宽度，松手后恢复。

### 语义结构与无障碍

`style` 和 `styles.root` 作用于根 View，且 `style` 优先；`styles.content` 作用于实际主体内容节点，私有动画层只负责水平位移。指定 `contentDragLimit` 时，主体位移、整行淡化和 action 展开使用同一进度：完整展开时正文靠边并完成淡化，关闭时三者同步反向恢复，且不拦截触摸。`styles.contentOverlay` 可配置遮罩样式，`contentOverlayColor` token 默认使用 55% 不透明度的主题 `colorBgContainer`，使文字淡化而不压暗行背景。遮罩位于 action 下方，不影响操作按钮。`styles.actions` 作用于双侧操作共用的区域，左右测量节点和占位节点属于内部实现。

主体提供按压背景反馈，但不默认声明为按钮，也不聚合子节点的无障碍语义。主体内部的交互控件保留自己的 role 和 label；action 关闭时正常触发业务事件，展开时主体点击与长按只用于收起。需要整行可访问或自定义无障碍操作时，可以通过根节点继承的 `ViewProps` 配置。

操作按钮保持挂载以测量宽度，但只有对应侧展开完成后才可交互、可被读屏访问；另一侧、收起状态、拖动及关闭过渡期间禁用操作区交互并隐藏其无障碍节点。`close()` 对已经关闭的项不触发 `onClose`，重复关闭也不会重复通知。删除列表项时应先记录待删除项，在 `onClose` 中移除，避免 action 回调立即卸载整行而跳过收拢动画；微信示例采用此方式，并使用主题 token 适配浅色与深色模式。

`actions` 是 `rightActions` 的简写；每一项可以使用 `text`、`color` 和 `onPress`。`leftActions` 和 `rightActions` 的每一项都会独立渲染为 `SwipeCellAction`，action slot 的测量宽度是所有 action 的总宽度。传入 action 数组时，数组优先于对应的旧 `leftAction` / `rightAction`。旧的 `label` 字段继续兼容，推荐新代码使用 `text`。

`TsukiProvider` 不再安装全局 SwipeCell manager。页面应使用 `useSwipeCellDismiss()`：把 `containerProps` 绑定到页面根节点，把 `getSwipeCellProps(id)` 绑定到每行；列表滚动及页面失焦时调用 `close()`。同一页面 Hook 在手势开始或命令式打开时立即登记操作行并关闭上一行，不等待 `onOpen` 完成；关闭会取消该行后续拖动更新，防止旧手势重新展开。外部按钮仍响应本次点击。

`useSwipeCellController()`、`SwipeCellContext`、`SwipeCellManager`、`useSwipeCellManager()` 和 `SwipeCellHandle` 已删除，不提供兼容层。已有页面应迁移到 `useSwipeCellDismiss()`。

### SwipeCellActionItem

```tsx
interface SwipeCellActionItem {
  key?: React.Key
  text?: ReactNode
  /** @deprecated Use text instead. */
  label?: ReactNode
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  backgroundColor?: ColorValue
  textColor?: ColorValue
  width?: number
  disabled?: boolean
  onPress?: PressableProps['onPress']
}
```

`width` 只控制该 action 的宽度；未指定时使用 token 的最小宽度和内容布局。`disabled` 会阻止点击，也不会触发默认关闭。

### SwipeCellAction

`SwipeCellAction` 是内置的 action 按钮，基于库内置 `Pressable` 渲染，点击时在原背景上提供黑色 10% overlay，并保留 action 区域的局部按压作用域；适合直接作为旧版 `leftAction` 或 `rightAction` 使用，也可用于保留高级自定义 Pressable 能力。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | action 内容；字符串和数字使用内置文字样式 |
| onPress | `PressableProps['onPress']` | — | action 点击回调 |
| color | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | — | 使用 SwipeCell 语义背景 token |
| backgroundColor | `ColorValue` | `SwipeCell` token | action 背景色 |
| textColor | `ColorValue` | `SwipeCell` token | 字符串/数字 children 的文字颜色 |
| width | `number` | — | 显式 action 宽度；不传时使用内容宽度和最小宽度 |
| style | `PressableProps['style']` | — | action Pressable 样式 |
| 其他 PressableProps | React Native `PressableProps` | — | 例如 `testID`、`accessibilityLabel`、`disabled` 和 `hitSlop` |

传入普通 `ReactNode` 时，SwipeCell 会自动使用 `SwipeCellAction` 包裹它；需要独立颜色、宽度或点击状态时，推荐显式传入 `SwipeCellAction`。

### SwipeCellRef

```tsx
const ref = useRef<SwipeCellRef>(null)

ref.current?.open('right')
ref.current?.open('left')
ref.current?.close()
```

### SwipeCellGroup

`SwipeCellGroup` 继承 React Native `ViewProps`。它提供显式的局部分组行为：任意一个 cell 通过拖动或 ref 打开时，其他已注册 cell 会自动关闭。新列表推荐使用页面级 `useSwipeCellDismiss()`；Group 不提供 overlay 或 outside press 行为。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | SwipeCell 子项 |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 样式 |
| 其他 ViewProps | React Native `ViewProps` | — | 例如 `testID`、`onLayout` 和 `accessibilityLabel` |

## 主题定制

通过 `ConfigProvider` 的 `theme.components.SwipeCell` 分别覆盖主体按压背景和 action 样式：

```tsx
<ConfigProvider
  theme={{
    components: {
      SwipeCell: {
        pressedBackgroundColor: '#f3ecff',
        actionBackgroundColor: '#7232DD',
        actionMinWidth: 88,
      },
    },
  }}
>
  <SwipeCell rightAction="更多">
    <Text>主题化行</Text>
  </SwipeCell>
</ConfigProvider>
```

可覆盖的 token 包括 `backgroundColor`、`contentOverlayColor`、`actionBackgroundColor`、`actionDefaultBackgroundColor`、`actionPrimaryBackgroundColor`、`actionSuccessBackgroundColor`、`actionWarningBackgroundColor`、`actionDangerBackgroundColor`、`actionTextColor`、`actionHeight`、`actionMinWidth`、`actionPaddingHorizontal`、`actionFontSize`、`actionLineHeight`、`actionPressedOverlayColor`、`animationDuration` 和 `fontFamily`。主题的 `motion: false` 会跳过吸附动画并直接设置目标位置。

当前不实现 Vant Web 专属的 DOM、`beforeClose`、`name`、`stopPropagation` 或浏览器事件 API。

### 按住时的样式

主体按压背景由 `theme.components.SwipeCell.pressedBackgroundColor` 独立定义，不读取 `Cell` 组件 token；默认值来自全局 `pressedBackgroundColor`：

```tsx
<ConfigProvider theme={{ components: { SwipeCell: { pressedBackgroundColor: '#eeeeee' } } }}>
  <SwipeCell actions={[{ text: '删除', color: 'danger' }]}>
    <View style={{ padding: 16 }}>
      <Text>消息</Text>
    </View>
  </SwipeCell>
</ConfigProvider>
```

子 `Cell` 的标题、背景等按住样式仍可以通过 `styles={({ state }) => ...}` 根据 `state.pressed` 配置。它只控制子 Cell 自身，不定义 SwipeCell 的主体反馈。SwipeCell action 展开时不显示主体按压反馈。

### 按压协调边界

SwipeCell 内部保留主体与 action 的局部按压作用域：展开时主体点击或长按仅关闭，拖动取消按压反馈；action 是否关闭由 `closeOnActionPress` 决定。TsukiProvider 不创建 manager，也不清空调用处的局部按压作用域；因此嵌套在主体内的 TsukiProvider 不会改变该主体的交互归属。Portal 与 Popover 浮层仍显式清除归属。

外部触摸与跨行单开由页面 `useSwipeCellDismiss()` 协调；未接入页面 Hook 或 Group 的独立行不会自动关闭其他行。自定义 Modal 等不同原生触摸层需单独接入。

微信全屏示例在页面根节点接入 `useSwipeCellDismiss()`，覆盖普通空白、其他行和原生按钮的外部触摸，无需背景遮罩或额外 SwipeCell Provider。独立 SwipeCell 不监听整页触摸。

微信示例设置 `contentDragLimit={58}`，对应行内边距 14 加头像宽度 44；展开后正文保留 12 点间距。正文向行左边缘移动的同时，action 在上层逐渐撑开并覆盖右侧内容；拖动时使用同一进度；松手及点击关闭时 action 平缓收拢，正文打开时轻微回弹、关闭时平滑归位，遮罩随 action 淡出；三个 action 各宽 64 点，总展开距离为 192 点；「置顶」使用 `warning` 配色。默认不限制主体位移，原有侧滑布局保持不变。

## 页面外部触摸关闭

`useSwipeCellDismiss()` 使用页面本地 refs 协调，不需要专用 Provider。返回：

| 返回值 | 用途 |
| --- | --- |
| `containerProps` | 展开到页面根 View；通过 `onStartShouldSetResponderCapture` 观察触摸，并始终返回 `false` |
| `getSwipeCellProps(id)` | 生成同一行稳定的 `ref`、`onOpenStart`、`onClose`、`onTouchStart` 绑定，直接传给 SwipeCell |
| `close()` | 关闭当前登记的展开行；可用于滚动开始、页面失焦和手动关闭 |

```tsx
const dismiss = useSwipeCellDismiss()

return (
  <View {...dismiss.containerProps} style={{ flex: 1 }}>
    <FlashList
      data={messages}
      keyExtractor={(item) => item.id}
      onScrollBeginDrag={dismiss.close}
      renderItem={({ item }) => (
        <SwipeCell
          key={item.id}
          {...dismiss.getSwipeCellProps(item.id)}
          actions={[{ text: '删除', color: 'danger' }]}
        >
          <Cell title={item.title} />
        </SwipeCell>
      )}
    />
  </View>
)
```

外部触摸调用 `close()`，同时保留外部按钮自身的点击；行内包含 action 的触摸不会被页面关闭逻辑误判。测量使用内置 SwipeCell ref 的 `measure()` 与触摸的 `pageX/pageY`，不混用窗口坐标。`SwipeCellRef.measure` 为兼容已有自定义 ref 保留为可选方法；Hook 应直接绑定到内置 SwipeCell，包装组件需要转发该方法。

id 必须唯一且稳定。行 ref 解绑时释放登记，旧行关闭回调与迟到的测量结果不会影响新行。FlashList 示例在数据 id 改变时重建行内 SwipeCell，避免将旧行展开状态带到复用后的数据。`getSwipeCellProps()` 返回的事件若有业务覆盖，必须先调用原绑定；已有 ref 也需要合并转发。

根节点已有 responder capture 时，需合并观察回调并保留原本的返回值。页面失焦时由导航生命周期调用 `dismiss.close()`；Modal 等独立原生根节点应单独接入。该 Hook 处理接入根节点内的触摸，不提供跨原生窗口的全局监听。

- [完整示例：页面外部触摸与 FlashList。](../../../src/swipe-cell/__fixtures__/examples/flash-list.tsx)
