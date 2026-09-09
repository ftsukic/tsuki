---
title: Collapse 折叠面板
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Collapse 折叠面板

<section className="component-doc-intro">

## 介绍

Collapse 用于将内容组织成可展开和收起的面板，支持多个面板同时展开，也支持 Vant 风格的 accordion 手风琴模式。

</section>

<code src="../../../src/collapse/__fixtures__/overview.tsx" title="组件预览" description="Collapse 的基础、手风琴、默认展开、禁用、受控和主题示例。"></code>

## 引入

```tsx | pure
import { Collapse, CollapseItem } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/collapse/__fixtures__/examples/basic.tsx" title="基础用法" description="默认允许多个面板同时展开。"></code>

<code src="../../../src/collapse/__fixtures__/examples/accordion.tsx" title="手风琴" description="accordion 模式下同一时间只展开一个面板。"></code>

<code src="../../../src/collapse/__fixtures__/examples/default.tsx" title="默认展开" description="使用 defaultValue 设置非受控初始展开项。"></code>

<code src="../../../src/collapse/__fixtures__/examples/disabled.tsx" title="禁用项" description="禁用项不响应点击，也不会触发 onChange。"></code>

<code src="../../../src/collapse/__fixtures__/examples/controlled.tsx" title="受控模式" description="使用 value 和 onChange 管理展开状态。"></code>

<code src="../../../src/collapse/__fixtures__/examples/theme.tsx" title="主题定制" description="通过 ConfigProvider 覆盖 Collapse component token。"></code>

## API

### Collapse

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 直接传入 `CollapseItem` 子项；其他直接子节点不会参与渲染 |
| value | `string \| number \| (string \| number)[]` | — | 受控展开值；accordion 模式使用单值，普通模式使用数组 |
| defaultValue | `string \| number \| (string \| number)[]` | — | 非受控初始展开值 |
| accordion | `boolean` | `false` | 是否只允许展开一个面板 |
| border | `boolean` | `true` | 是否显示根部上下边框、各面板之间及展开标题下的内缩 hairline 分隔线 |
| onChange | `(value: CollapseValue) => void` | — | 展开值变化时触发 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |

`Collapse` 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。`value` 存在时为受控模式；受控模式下点击只触发 `onChange`，实际展开状态由父组件更新 `value` 决定。

普通模式的回调值始终是数组，accordion 模式的回调值是当前 name 或空字符串。组件支持字符串和数字 name，并使用 `Object.is` 匹配展开项。

### CollapseItem

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `string \| number` | — | 当前面板的唯一名称 |
| title | `ReactNode` | — | Header 标题；字符串和数字使用组件标题样式 |
| disabled | `boolean` | `false` | 禁止点击展开，标题和箭头使用禁用颜色 |
| icon | `ReactNode` | — | Header 左侧图标或自定义内容 |
| children | `ReactNode` | — | 内容区域；字符串和数字使用内容文本样式 |
| style | `StyleProp<ViewStyle>` | — | 当前 Header 的 Pressable 样式 |
| 其他 PressableProps | React Native `PressableProps` | — | 例如 `testID`、`accessibilityLabel`、`hitSlop` 和 `onPressIn` |

右侧箭头由组件管理，关闭时为 `90deg`，展开时动画到 `-90deg`，与 Vant 的右箭头方向保持一致。Header 默认无障碍角色为 `button`，并同步 `expanded` 与 `disabled` 状态。`onPress` 不作为公开覆盖点，面板切换统一由 Collapse 管理。

内容区域始终保持挂载，通过 Reanimated 的高度动画进行裁剪；组件当前不提供 Vant 的 `lazyRender`、`readonly`、`toggleAll`、`value`、`label` 和 Web DOM 属性。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Collapse` 覆盖 token：

| Token | 默认来源 | 说明 |
| --- | --- | --- |
| headerHeight | Cell normal 行高（默认 `44`） | Header 最小高度 |
| paddingHorizontal | `padding` | Header 水平内边距 |
| titleFontSize / titleLineHeight | Cell 字体 token | 标题字号和行高 |
| titleColor | `colorText` | 标题颜色 |
| iconColor / iconSize | `colorIcon` / `fontSizeLG` | 图标颜色和尺寸 |
| activeColor | `interactionActiveColor` | Header 按压背景 |
| disabledColor / disabledOpacity | `colorTextDisabled` / `1` | 禁用标题/箭头颜色；可用 `disabledOpacity` 自定义整行透明度 |
| contentPaddingVertical / contentPaddingHorizontal | `paddingSM` / `padding` | 内容区域内边距 |
| contentTextColor | `colorTextSecondary` | 内容文字颜色 |
| contentBackgroundColor | `colorBgContainer` | 内容背景 |
| borderColor / borderWidth | `colorBorder` / `lineWidthHairline` | 外层边框、面板间和展开标题下的内部分隔线 |
| animationDuration | `motionDurationSlow`（默认 `300ms`） | 高度和箭头动画时长；缓动为 `ease-in-out` |

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      Collapse: {
        headerHeight: 52,
        animationDuration: 220,
      },
    },
  }}
>
  <Collapse>
    <CollapseItem name="one" title="可定制标题">
      内容
    </CollapseItem>
  </Collapse>
</ConfigProvider>
```

Collapse 的 Header 参照 Cell 的行高、内边距、字体和图标间距，但不继承 Cell，也不提供 Cell 的 `value`、`label`、`isLink` 等 API；Header 仅复用现有 Pressable、Icon、Text 和主题 token 体系。
