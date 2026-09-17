---
title: Button 按钮
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Button 按钮

<section className="component-doc-intro">

## 介绍

按钮用于触发操作，支持 Vant 风格的类型、尺寸、视觉变体、加载状态和 `default`、`round`、`square`、`circle` 形状。

</section>

<code src="../../../src/button/__fixtures__/overview.tsx" title="组件预览" description="Button 的类型、状态和形状预览。"></code>

## 引入

```tsx | pure
import { Button, Icon } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/button/__fixtures__/examples/variants.tsx" title="类型、尺寸和状态" description="展示 Button 的类型、尺寸、禁用、加载和语义样式。"></code>

<code src="../../../src/button/__fixtures__/examples/shapes.tsx" title="形状" description="并排比较默认、方角、胶囊和不同尺寸的圆形图标按钮。"></code>

<code src="../../../src/button/__fixtures__/examples/group.tsx" title="Button.Group" description="展示连接按钮组、统一尺寸、视觉变体、显式尺寸覆盖和单按钮组。"></code>

## API

### Button

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 按钮内容；`circle` 不禁止传入内容，但固定尺寸主要用于图标操作 |
| type | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 按钮语义和配色 |
| size | `'large' \| 'normal' \| 'small' \| 'mini'` | `'normal'` | 按钮尺寸；`circle` 直接使用对应的高度 token |
| color | `ColorValue` | — | 自定义前景色和实心背景/边框色 |
| variant | `'solid' \| 'filled' \| 'outline' \| 'dashed' \| 'text'` | `'solid'` | 视觉变体 |
| shape | `'default' \| 'round' \| 'square' \| 'circle'` | `'default'` | 按钮形状；显式 `shape` 优先于旧的形状 boolean |
| plain | `boolean` | `false` | 兼容写法，等价于 `variant="outline"`；显式 `variant` 优先 |
| block | `boolean` | `false` | 非 `circle` 且非 `text` 按钮占满父级可用宽度；`text` 变体仍按可见内容尺寸布局 |
| square | `boolean` | `false` | 方角按钮，只将圆角移除为 `0`；保留正常高度、水平内边距和内容决定的宽度，不是固定正方形 |
| round | `boolean` | `false` | 胶囊按钮；保留内容决定的宽度并使用足够大的圆角 |
| circle | `boolean` | `false` | 固定宽高的圆形按钮：`width === height === 当前 size 的高度`，水平内边距为 `0`，主要用于 icon-only action |
| hairline | `boolean` | `false` | 使用 React Native 的 hairline border |
| disabled | `boolean` | `false` | 禁用按钮并应用禁用透明度 |
| loading | `boolean` | `false` | 显示 `Loading` 并禁用 press；`circle` loading 仍保持固定圆形尺寸 |
| loadingText | `ReactNode` | — | loading 时替代 `children` 显示的内容 |
| loadingType | `'circular' \| 'spinner'` | `'circular'` | loading 指示器类型 |
| loadingSize | `number` | 当前 Button 字号 | loading 指示器尺寸；未传入时根据当前 Button size/font token 推导 |
| icon | `ReactNode` | — | 图标节点；`circle` 不为图标增加左右间距 |
| iconPosition | `'left' \| 'right'` | `'left'` | 非圆形按钮中图标相对文本的位置 |
| style | `StyleProp<ViewStyle>` | — | Button root 节点样式，优先级高于默认样式和 `styles.root` |
| styles | `ButtonStyles` | — | `root`、`icon`、`label`、`contentContainer` 的语义样式；`content` 是 `label` 的兼容别名 |
| onPressDebounceWait | `number` | — | 两次 `onPress` 之间的最小间隔，单位为毫秒 |

`variant="text"` 默认不使用普通 Button 的最小高度、水平内边距或 `contentContainer` 最小高度，点击区域与可见 content 一致；按下时通过通用 `Pressable` 提供 `pressedOpacity` 文字透明度反馈，需要扩大点击区域时可显式传入 `style` 或 `hitSlop`。其他变体按下时显示由 `pressedOverlayColor` 控制的覆盖层，默认值为 `rgba(0, 0, 0, 0.1)`。

Button 继承 React Native `PressableProps`，但由组件管理 `children`、`style` 和 `disabled`。默认 `accessibilityRole` 为 `button`；icon-only `circle` 应设置 `accessibilityLabel`：

```tsx | pure
<Button
  circle
  icon={<Icon name="PlusOutlined" size={18} />}
  accessibilityLabel="新增"
  onPress={createItem}
/>
```

### 形状规则

- 不传形状时使用 Button token 的 `borderRadius`；默认按钮在不同 `size` 下仍使用同一个 `borderRadius`。
- `shape="round"` 使用 Button token 的 `borderRadiusRound`；`shape="square"` 和 `shape="circle"` 分别对应方角和圆形。
- `square` 是方角，不代表 `width === height`；`round` 是胶囊，不改变内容决定的宽度。
- `circle` 使用 `heightXS`、`heightSM`、`height`、`heightLG` 分别对应 `mini`、`small`、`normal`、`large`，并将宽度设为相同值、水平内边距设为 `0`。
- 同时传入多个形状 boolean 时不报错，优先级为 `circle > square > round > default`。`circle` 也优先于 `block`，不会被拉伸为横向按钮。

### 主题定制

通过 `ConfigProvider` 的 `theme.components.Button` 覆盖 Button token。形状相关的 token 包括 `borderRadius`、`heightXS`、`heightSM`、`height`、`heightLG` 以及各尺寸的 `paddingHorizontal`；`pressedOpacity` 控制 `text` 变体的按下透明度，`pressedOverlayColor` 控制实体变体的按下覆盖层；不要为 `circle` 额外定义专用宽高 token。

```tsx | pure
import { Button, ConfigProvider } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Button: { borderRadius: 12 } } }}>
  <Button round>圆角操作</Button>
</ConfigProvider>
```

组件同时保留 `round`、`square`、`circle` 形状 boolean 作为兼容写法；不提供 Web 专属的 `link`、`ghost`、`textColor`、`textStyle`、HTML 属性或 DOM API。

### Button.Group

`Button.Group` 是 Button 的静态子组件，也可以通过 named export `ButtonGroup` 引入。它默认横向排列直接传入的 Button，并连接相邻按钮的边框与内侧圆角。推荐直接放置 `Button` children；Group 可以统一透传 `size`、`shape` 和 `variant`，子 Button 显式属性优先。

```tsx | pure
import { Button, ButtonGroup } from '@ftsukic/tsuki'

;<Button.Group size="small" variant="outline">
  <Button>左侧</Button>
  <Button size="large">显式尺寸优先</Button>
  <Button>右侧</Button>
</Button.Group>

// Button.Group === ButtonGroup
```

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 推荐传入直接的 `Button` 子项；实际子项位置用于连接圆角和边框 |
| size | `ButtonSize` | — | Group 尺寸；未显式设置 `size` 的 Button 继承此值，Button 子项显式 `size` 优先 |
| shape | `'default' \| 'round'` | `'default'` | Group 形状；未显式设置形状的 Button 子项继承此值 |
| variant | `ButtonVariant` | — | Group 视觉变体；未显式设置 `variant` 的 Button 子项继承此值，子项显式 `variant` 优先 |
| block | `boolean` | `false` | Group 占满父级可用宽度，直接 Button 子项等分可用宽度 |
| style | `StyleProp<ViewStyle>` | — | Group 根 View 的样式；默认 `flexDirection: 'row'`，显式样式优先 |
| 其他 ViewProps | React Native `ViewProps` | — | Group 继承 View 的其他属性，例如 `testID`、`accessibilityLabel` 和 `onLayout` |

Group 不添加 `gap`。有边框的相邻 Button 使用实际 `borderWidth` 消除双边框；`filled`、`text` 等无边框变体不会产生负 `marginLeft`。设置 `block` 后 Group 撑满父级宽度，直接 Button 子项等分可用空间。Group 的 `variant` 只作为未显式设置子项的默认值，不会覆盖子 Button 自己的 `variant`。单个 Button 保持自身显式 `shape` 或 `round`、`square`、`circle` 的形状行为。
