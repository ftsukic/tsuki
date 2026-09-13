---
title: Tabs 标签页
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Tabs 标签页

<section className="component-doc-intro">

## 介绍

Tabs 用于在多个页面、筛选项或内容分区之间切换。组件提供 Vant 风格的 `line` 和 `card` 两种导航样式；Tab 标题和可选内容分开声明，省略内容时可以只作为导航使用。

</section>

<code src="../../../src/tabs/__fixtures__/overview.tsx" title="组件预览" description="Tabs 的 line、card、禁用、滚动、shrink、受控、手势和 lazyRender 用法。"></code>

## 引入

```tsx | pure
import { Tab, Tabs } from '@ftsukic/tsuki'
```

也可以使用 compound API：

```tsx | pure
import { Tabs } from '@ftsukic/tsuki'

;<Tabs>
  <Tabs.Tab name="notice" title="通知" />
</Tabs>
```

## 代码演示

<code src="../../../src/tabs/__fixtures__/examples/line-basic.tsx" title="Line 基础用法" description="默认 line 样式可以同时作为内容切换器和导航。"></code>

<code src="../../../src/tabs/__fixtures__/examples/card-basic.tsx" title="Card 基础用法" description="使用 card 样式展示 Vant 风格的卡片标签。"></code>

<code src="../../../src/tabs/__fixtures__/examples/disabled.tsx" title="禁用 Tab" description="禁用项仍然展示，但不响应点击。"></code>

<code src="../../../src/tabs/__fixtures__/examples/scrollable.tsx" title="横向滚动" description="scrollable 适合较多 Tab 的横向导航。"></code>

<code src="../../../src/tabs/__fixtures__/examples/shrink.tsx" title="Shrink 布局" description="shrink 让标题按内容布局，并支持 titleStyle。"></code>

<code src="../../../src/tabs/__fixtures__/examples/controlled.tsx" title="受控切换" description="使用 value 和 onChange 由页面统一管理激活值。"></code>

<code src="../../../src/tabs/__fixtures__/examples/swipeable.tsx" title="手势切换" description="启用 swipeable 后可以通过横向手势切换内容。"></code>

<code src="../../../src/tabs/__fixtures__/examples/lazy-render.tsx" title="Lazy render" description="页面首次激活后保持挂载，切换回来时内部状态不丢失。"></code>

<code src="../../../src/tabs/__fixtures__/examples/theme.tsx" title="主题与语义样式" description="通过组件 token 和 styles 定制 Tabs。"></code>

## API

### Tabs

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 直接传入 `Tab` 子项；非 `Tab` 子节点不会参与导航 |
| value | `string \| number` | — | 受控激活值 |
| defaultValue | `string \| number` | 第一个可用 Tab | 非受控初始激活值 |
| onChange | `(value: string \| number) => void` | — | 用户请求切换到其他可用 Tab 时触发；受控模式不会替代 `value`，重复点击当前项不会触发 |
| type | `'line' \| 'card'` | `'line'` | 导航样式 |
| animated | `boolean` | `true` | 同时控制 line indicator 和内容页的程序切换/吸附动画；主题关闭 motion 时立即切换 |
| swipeable | `boolean` | `false` | 内容存在时允许横向手势切换；手势到达 disabled Tab 会恢复当前可用页且不触发 `onChange` |
| scrollable | `boolean` | `false` | Tab 数量较多时启用横向滚动；默认 Tab 等分宽度 |
| shrink | `boolean` | `false` | 按标题内容布局 Tab，并启用横向滚动；等价于 `scrollable || shrink` 的导航行为 |
| lazyRender | `boolean` | `true` | 首次激活前不渲染 pane；首次激活后保持挂载，后续切换不卸载 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `TabsStyles` | — | `root`、`nav`、`tab`、`label`、`indicator`、`content` 语义样式 |

Tabs 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。根节点默认无障碍角色为 `tablist`，每个 Tab 默认角色为 `tab`，并同步 `selected` 和 `disabled` 状态。

### Tab

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `string \| number` | 内部 index | Tab 的选择值；受控使用时应提供稳定值 |
| title | `ReactNode` | — | 导航标题；字符串和数字使用库内 `Text` 样式 |
| titleStyle | `StyleProp<TextStyle>` | — | 字符串或数字标题的文字样式 |
| disabled | `boolean` | `false` | 禁止点击和状态变化 |
| children | `ReactNode` | — | 可选内容；由 Tabs 的 `lazyRender` 决定首次渲染时机 |
| style | `StyleProp<ViewStyle>` | — | 当前 Tab 的 Pressable 样式 |
| 其他 PressableProps | React Native `PressableProps` | — | 例如 `testID`、`accessibilityLabel`、`hitSlop` 和 `onPressIn` |

`Tab` 是声明式子项，交互由 Tabs 内部的 `InteractionPressable` 提供。整个 Tab 区域都可以点击；disabled 时不会触发 `onChange`。没有 `name` 时使用当前 index，适合无受控需求的导航场景。

Tab 的 `children` 不要求存在。没有任何 pane 内容时，Tabs 只渲染导航，不生成空内容区域。`lazyRender` 默认为 visit-once：pane 首次激活前不渲染，激活后保持挂载；设为 `false` 时所有 pane 一开始都挂载。`swipeable` 只在存在内容时启用横向手势，不会把 navigation-only Tab 变成空页面。

`value` 存在时 Tabs 是严格受控的：点击或手势切换只调用 `onChange`，界面继续由当前 `value` 决定；父组件回写新值后才改变激活项。`defaultValue` 只用于非受控初始化；无效值或 disabled 值会回退到第一个可用 Tab。

## 语义样式

```tsx | pure
<Tabs
  styles={({ state }) => ({
    nav: { paddingHorizontal: state.scrollable ? 4 : 0 },
    label: { fontWeight: state.activeIndex === 0 ? '600' : '400' },
  })}
>
  <Tab name="first" title="第一项" />
  <Tab name="second" title="第二项" />
</Tabs>
```

`style` 和 `styles.root` 作用于根节点；`styles.nav` 作用于导航容器；`styles.tab`、`styles.label`、`styles.indicator` 和 `styles.content` 作用于对应内部节点。Tab 自身的 `style` 作用于该项的完整点击区域。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Tabs` 覆盖组件 token：

| Token                            | 默认来源               | 说明                |
| -------------------------------- | ---------------------- | ------------------- |
| height                           | `controlHeight`        | 导航高度            |
| paddingHorizontal                | `paddingSM`            | Tab 水平内边距      |
| fontSize                         | `fontSize`             | 标题字号            |
| activeColor                      | `colorPrimary`         | line 激活颜色       |
| inactiveColor                    | `colorText`            | 未激活标题颜色      |
| disabledColor                    | `colorTextDisabled`    | 禁用标题颜色        |
| indicatorHeight / indicatorWidth | `2` / `40`             | line indicator 尺寸 |
| borderColor                      | `colorBorderSecondary` | line 底部边框颜色   |
| cardRadius                       | `borderRadiusSM`       | card 圆角           |
| cardBorderColor                  | `colorPrimary`         | card 边框颜色       |
| cardBackgroundColor              | `colorBgContainer`     | card 未激活背景     |
| cardActiveBackgroundColor        | `colorPrimary`         | card 激活背景       |
| cardActiveTextColor              | `colorTextLightSolid`  | card 激活文字颜色   |
| animationDuration                | `motionDurationFast`   | indicator 动画时长  |

```tsx | pure
<ConfigProvider theme={{ components: { Tabs: { indicatorWidth: 48, cardRadius: 6 } } }}>
  <Tabs>
    <Tab title="通知" />
    <Tab title="消息" />
  </Tabs>
</ConfigProvider>
```

Tabs 使用主题 token 和 `InteractionPressable`，不提供 Web 专属的 `className`、HTML 属性或 DOM API；不包含路由绑定和强制内容面板 API。
