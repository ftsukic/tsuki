---
title: ActionSheet 动作面板
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# ActionSheet 动作面板

<section className="component-doc-intro">

## 介绍

ActionSheet 用于从底部展示一组操作。它复用 Popup 的 bottom 定位、底部安全区、滑入动画和 Overlay 遮罩，并使用统一的 `Pressable` 提供点击反馈。

</section>

<code src="../../../src/action-sheet/__fixtures__/overview.tsx" title="组件预览" description="ActionSheet 的基础菜单、标题、自定义颜色、禁用、加载和自定义内容预览。"></code>

## 引入

```tsx | pure
import {
  ActionSheet,
  ConfigProvider,
  PortalHost,
  TsukiProvider,
  showActionSheet,
} from '@ftsukic/tsuki'
```

受控组件和命令式 API 都需要当前应用存在 `PortalHost`。应用通常直接使用同时提供主题和 Portal 宿主的 `TsukiProvider`：

```tsx | pure
<TsukiProvider>
  <App />
</TsukiProvider>
```

## 代码演示

<code src="../../../src/action-sheet/__fixtures__/examples/basic.tsx" title="基础用法" description="展示普通 action 和取消按钮。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/title.tsx" title="带标题" description="标题仅用于说明，不参与点击。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/custom-color.tsx" title="自定义颜色 action" description="使用 color 设置删除等破坏性操作的颜色。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/disabled.tsx" title="禁用 action" description="禁用项仍然展示，但不会响应点击。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/loading.tsx" title="加载 action" description="加载项显示 Loading 并禁止重复触发。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/custom-subname.tsx" title="自定义 subname" description="name 和 subname 都可以传入 ReactNode。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/long-list.tsx" title="长操作列表" description="列表滚动，标题和取消区保持可见；打开后增加操作，检查退出动画和取消背景。"></code>

## API

### ActionSheetProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | `false` | 是否显示；ActionSheet 是受控组件 |
| title | `ReactNode` | — | 顶部说明标题，不参与点击 |
| actions | `readonly ActionSheetAction[]` | `[]` | 操作列表 |
| cancelText | `ReactNode` | `'取消'` | 底部取消按钮文案；传 `null` 或 `false` 可隐藏，`undefined` 使用默认文案 |
| closeOnAction | `boolean` | `true` | action 点击后是否发出关闭请求；对应 Vant 的 `closeOnClickAction`，当前名称尚未对齐 |
| closeOnPressOverlay | `boolean` | `true` | 点击遮罩是否发出关闭请求 |
| overlay | `boolean` | `true` | 是否渲染全屏遮罩 |
| safeAreaInsetBottom | `boolean` | `true` | 是否在面板根部追加底部安全区；有取消按钮时安全区属于取消按钮的按压区域 |
| zIndex | `number` | 主题 `zIndex` | 浮层宿主层级 |
| style | `StyleProp<ViewStyle>` | — | 全屏浮层 root 样式 |
| styles | `ActionSheetStyles` | — | `mask`、`wrapper`、`container`、`root`、`body`、`header`、`title`、`item`、`label`、`description`、`footer`、`cancel`、`cancelLabel` 语义样式；支持对象或函数。 |
| onClose | `() => void` | — | 关闭请求回调；调用方应更新 `visible={false}` |
| onSelect | `(action, index) => void` | — | action 选中回调；接收当前 action 和其索引 |
| onPressOverlay | `(event) => void` | — | 点击遮罩回调 |
| onOpened | `() => void` | — | 打开动画完成后回调 |
| onClosed | `() => void` | — | 关闭动画完成后回调 |

组件继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`；其余 View props 会透传到面板 root，ref 也指向该节点。`style` 和 `styles.root` 作用于全屏根节点，`styles.container` 作用于面板，`styles.mask` 作用于遮罩，其他 slots 作用于对应内部节点。

面板最大高度为窗口高度减去顶部安全区。标题和取消区固定，操作列表超出可用空间时滚动；短列表仍由内容自然撑开。

| 语义槽位 | 作用范围 |
| --- | --- |
| root / mask / wrapper | 全屏浮层 / 遮罩 / 面板定位层 |
| container | 面板内容根节点，负责整体圆角与裁切；最大高度仍受窗口约束 |
| body | 标题和可滚动操作列表的共同区域 |
| header / title | 固定标题区域 / 标题文字 |
| item / label / description | 操作点击区域 / 主文字 / 辅助文字 |
| footer | 取消按钮和底部安全区的共同区域 |
| cancel / cancelLabel | 取消内容 / 取消文字；`cancel.backgroundColor` 覆盖整个取消点击区域，包括底部安全区，按压时使用取消按压 token |

`label`、`description`、`title` 和 `cancelLabel` 的文字样式只应用于字符串或数字；自定义 ReactNode 自行管理样式。

ActionSheet 不会直接修改 `visible`。action、取消按钮和默认遮罩点击都会先触发 action 回调（如果有），再触发 `onClose`；父组件需要在回调中设置 `visible={false}`。设置 `closeOnAction={false}` 后 action 仍会执行，但不触发关闭请求。

`safeAreaInsetBottom` 仅在 bottom Popup 面板上生效；有取消按钮时，底部安全区与取消内容共用一个 `Pressable`，取消按压背景会连续覆盖两者；没有取消按钮时安全区作为 actions surface 的独立 View 追加。没有 `SafeAreaProvider` 或 bottom inset 时高度按 `0` 处理。

### ActionSheetAction

| 属性     | 类型               | 默认值  | 说明                                         |
| -------- | ------------------ | ------- | -------------------------------------------- |
| name     | `ReactNode`        | —       | action 主内容；字符串和数字使用主题文字样式  |
| subname  | `ReactNode`        | —       | action 辅助说明；支持自定义 ReactNode        |
| color    | `string`           | —       | action 主内容颜色                            |
| loading  | `boolean`          | `false` | 显示加载指示器并禁止点击                     |
| disabled | `boolean`          | `false` | 禁用点击并使用禁用视觉                       |
| callback | `(action) => void` | —       | action 点击回调；disabled/loading 时不会触发 |

每个 action 都是完整的 `Pressable` 点击区域，默认无障碍角色为 `button`，disabled/loading 会同步 `accessibilityState`。标题不参与操作导航；面板标记为 modal。当前不支持 action 级别的 `style`、`accessibilityLabel` 或额外 Pressable props；需要自定义内容时使用 `name` 和 `subname` 的 ReactNode。

ActionSheet 级别的 `onSelect` 接收 `(action, index)`，在 action 的 `callback(action)` 之后触发；它不会被 `closeOnAction` 替代。

`callback` 或 `onSelect` 同步抛错时，内部选择结算和默认关闭仍会执行，错误继续向调用方传播；`closeOnAction={false}` 时仍保留面板。

### 命令式 API

```tsx | pure
const result = await showActionSheet({
  title: '请选择',
  actions: [
    { name: '编辑', value: 'edit' as const },
    { name: '删除', value: 'delete' as const, color: '#ee0a24' },
  ],
})

// result 是被选中的原始 action 对象；取消或关闭时为 undefined。
if (result) {
  console.log(result.value)
}
```

| API | 类型 | 说明 |
| --- | --- | --- |
| showActionSheet | `<T extends ActionSheetAction>(options?: ActionSheetOptions<T>) => Promise<T \| undefined>` | 创建或更新当前命令式实例；选择 action 后返回用户传入的原始 action 对象，取消或关闭时为 `undefined` |
| closeActionSheet | `() => void` | 关闭当前实例，并以 `undefined` 结算当前 Promise；没有实例时安全无效 |
| setActionSheetDefaultOptions | `(options: ActionSheetOptions) => void` | 设置命令式默认参数，显式参数优先 |
| resetActionSheetDefaultOptions | `() => void` | 恢复默认参数 |

命令式实例通过当前 `PortalHost` 挂载，关闭动画完成后才卸载 Portal。新的 `showActionSheet` 会先以 `undefined` 结算前一个 pending Promise，再接管当前实例。`closeActionSheet()` 同样以 `undefined` 结算当前 Promise；宿主卸载时 pending Promise 也会以 `undefined` 结束。选择 action 返回用户传入的原始 action 对象，因此自定义字段会被保留并由 TypeScript 自动推导。没有 `PortalHost` 时 `showActionSheet` 会抛出 Portal 宿主错误。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.ActionSheet` 配置：

| Token | 默认来源 | 说明 |
| --- | --- | --- |
| backgroundColor | `colorBgContainer` | action、取消区域背景色 |
| actionPressedBackgroundColor | `pressedBackgroundColor` | 可用 action 按下时的背景色；disabled/loading 不使用，并与取消间隔保持区分 |
| cancelPressedBackgroundColor | `pressedBackgroundColor` | 取消内容与底部 safe-area 按下时的统一背景色 |
| titleColor | `colorTextSecondary` | 标题颜色 |
| actionColor | `colorText` | 普通 action 和取消文字颜色 |
| descriptionColor | `colorTextSecondary` | description 颜色 |
| disabledColor | `colorTextDisabled` | disabled/loading 文字颜色 |
| loadingColor | `colorIcon` | Loading 指示器颜色 |
| dividerColor | `colorBorderSecondary` | action 分隔线颜色 |
| borderRadius | `borderRadiusLG` | 统一 sheet root 顶部与 actions 的圆角；cancel 不单独设置圆角 |
| titleFontSize / titleLineHeight | `fontSizeSM / lineHeightSM` | 标题文字尺寸 |
| actionFontSize / actionLineHeight | `fontSizeLG / lineHeightLG` | action 文字尺寸 |
| descriptionFontSize / descriptionLineHeight | `fontSizeSM / lineHeightSM` | description 文字尺寸 |
| titleHeight | `48` | 标题区域高度 |
| actionPaddingHorizontal | `padding` | action 和取消按钮水平内边距 |
| actionPaddingVertical | `14` | action 垂直内边距；高度由内容自然撑开 |
| titlePaddingHorizontal / titlePaddingVertical | `padding / paddingSM` | 标题内边距 |
| descriptionMarginTop | `paddingXXS` | name 与 description 间距 |
| cancelGap | `paddingSM` | actions 与取消区域之间的非交互间距 |
| cancelGapColor | `colorBgLayout` | 取消区域间距背景色 |
| cancelPaddingVertical | `14` | 取消按钮垂直内边距 |
| animationDuration | `motionDurationMid` | Popup 滑入/滑出动画时长 |
| zIndex | `zIndexPopupBase` | 浮层层级 |
| fontFamily | `fontFamily` | 文字字体 |

`theme.seed.motion=false` 时 Popup 动画时长强制为 `0`，但打开/关闭生命周期仍然触发。ActionSheet 使用 Popup 的 bottom translateY 动画，并由同一个 transition progress 驱动 Overlay opacity；底部 safe-area 纳入取消 pressable，使取消内容与安全区共享 pressed 背景色；组件不单独提供 transition API。

## 动画

ActionSheet 复用 Popup 的底部平移和遮罩渐变，整个面板一起运动。遵循 `TsukiProvider motion` 的开关、Reduced Motion 和时长倍率；Portal 在退出完成后卸载。

进入和退出期间固定平移距离，稳定展示时更新面板测量；操作数量或内容高度变化后，退出使用最新高度。面板圆角仅由 ActionSheet 的 token 或 `styles.container` 管理，不受 Popup 圆角 token 影响。
