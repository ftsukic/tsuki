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

ActionSheet 用于从底部展示一组操作。它复用 Popup 的 bottom 定位、底部安全区、滑入动画和 Overlay 遮罩，并使用统一的 `InteractionPressable` 提供点击反馈。

</section>

<code src="../../../src/action-sheet/__fixtures__/overview.tsx" title="组件预览" description="ActionSheet 的基础菜单、标题、自定义颜色、禁用、加载和自定义内容预览。"></code>

## 引入

```tsx | pure
import { ActionSheet, ConfigProvider, PortalHost, Provider, showActionSheet } from '@ftsukic/tsuki'
```

受控组件和命令式 API 都需要当前应用存在 `PortalHost`。应用通常直接使用同时提供主题和 Portal 宿主的 `Provider`：

```tsx | pure
<Provider>
  <App />
</Provider>
```

## 代码演示

<code src="../../../src/action-sheet/__fixtures__/examples/basic.tsx" title="基础用法" description="展示普通 action 和取消按钮。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/title.tsx" title="带标题" description="标题仅用于说明，不参与点击。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/custom-color.tsx" title="自定义颜色 action" description="使用 color 设置删除等破坏性操作的颜色。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/disabled.tsx" title="禁用 action" description="禁用项仍然展示，但不会响应点击。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/loading.tsx" title="加载 action" description="加载项显示 Loading 并禁止重复触发。"></code>

<code src="../../../src/action-sheet/__fixtures__/examples/custom-subname.tsx" title="自定义 subname" description="name 和 subname 都可以传入 ReactNode。"></code>

## API

### ActionSheetProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | `false` | 是否显示；ActionSheet 是受控组件 |
| title | `ReactNode` | — | 顶部说明标题，不参与点击 |
| actions | `readonly ActionSheetAction[]` | `[]` | 操作列表 |
| cancelText | `ReactNode` | `'取消'` | 底部取消按钮文案；传 `null`、`undefined` 或 `false` 可隐藏 |
| closeOnAction | `boolean` | `true` | action 点击后是否发出关闭请求；对应 Vant 的 `closeOnClickAction`，当前名称尚未对齐 |
| closeOnPressOverlay | `boolean` | `true` | 点击遮罩是否发出关闭请求 |
| overlay | `boolean` | `true` | 是否渲染全屏遮罩 |
| safeAreaInsetBottom | `boolean` | `true` | 是否在面板根部追加底部安全区；有取消按钮时安全区属于取消按钮的按压区域 |
| overlayStyle | `StyleProp<ViewStyle>` | — | 遮罩样式；遮罩透明度仍参与动画 |
| zIndex | `number` | 主题 `zIndex` | 浮层宿主层级 |
| style | `StyleProp<ViewStyle>` | — | 面板 root 样式 |
| styles | `ActionSheetStyles` | — | `host / overlay / root / actions / header / title / action / name / subname / cancelGap / cancelPanel / cancel / cancelLabel` 语义样式 |
| onClose | `() => void` | — | 关闭请求回调；调用方应更新 `visible={false}` |
| onSelect | `(action, index) => void` | — | action 选中回调；接收当前 action 和其索引 |
| onPressOverlay | `(event) => void` | — | 点击遮罩回调 |
| onOpened | `() => void` | — | 打开动画完成后回调 |
| onClosed | `() => void` | — | 关闭动画完成后回调 |

组件继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`；其余 View props 会透传到面板 root，ref 也指向该节点。`style` 只作用于面板，`styles.host` 作用于 Popup 宿主，`styles.overlay` 作用于遮罩，其他 slots 作用于对应内部节点。

ActionSheet 不会直接修改 `visible`。action、取消按钮和默认遮罩点击都会先触发 action 回调（如果有），再触发 `onClose`；父组件需要在回调中设置 `visible={false}`。设置 `closeOnAction={false}` 后 action 仍会执行，但不触发关闭请求。

`safeAreaInsetBottom` 仅在 bottom Popup 面板上生效；有取消按钮时，底部安全区与取消内容共用一个 `InteractionPressable`，取消按压背景会连续覆盖两者；没有取消按钮时安全区作为 actions surface 的独立 View 追加。没有 `SafeAreaProvider` 或 bottom inset 时高度按 `0` 处理。

### ActionSheetAction

| 属性     | 类型               | 默认值  | 说明                                         |
| -------- | ------------------ | ------- | -------------------------------------------- |
| name     | `ReactNode`        | —       | action 主内容；字符串和数字使用主题文字样式  |
| subname  | `ReactNode`        | —       | action 辅助说明；支持自定义 ReactNode        |
| color    | `string`           | —       | action 主内容颜色                            |
| loading  | `boolean`          | `false` | 显示加载指示器并禁止点击                     |
| disabled | `boolean`          | `false` | 禁用点击并使用禁用视觉                       |
| callback | `(action) => void` | —       | action 点击回调；disabled/loading 时不会触发 |

每个 action 都是完整的 `InteractionPressable` 点击区域，默认无障碍角色为 `button`，disabled/loading 会同步 `accessibilityState`。标题不参与操作导航；面板标记为 modal。当前不支持 action 级别的 `style`、`accessibilityLabel` 或额外 Pressable props；需要自定义内容时使用 `name` 和 `subname` 的 ReactNode。

ActionSheet 级别的 `onSelect` 接收 `(action, index)`，在 action 的 `callback(action)` 之后触发；它不会被 `closeOnAction` 替代。

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

`theme.token.motion=false` 时 Popup 动画时长强制为 `0`，但打开/关闭生命周期仍然触发。ActionSheet 使用 Popup 的 bottom translateY 动画，并由同一个 transition progress 驱动 Overlay opacity；底部 safe-area 纳入取消 pressable，使取消内容与安全区共享 pressed 背景色；组件不单独提供 transition API。
