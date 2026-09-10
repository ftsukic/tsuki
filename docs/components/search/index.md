---
title: Search 搜索
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# Search 搜索

<section className="component-doc-intro">

## 介绍

Search 是面向列表过滤、联系人搜索和 IM 搜索入口的高频输入组件。它复用共享的 `TextInput` 基础能力，默认使用 round 背景、搜索图标和有值时的清除按钮，并提供 Vant 风格的 `prefix`/`suffix` 布局区域。

</section>

<code src="../../../src/search/__fixtures__/overview.tsx" title="组件预览" description="Search 汇总基础、布局扩展、尺寸、输入状态和联系人搜索场景。"></code>

## 引入

```tsx | pure
import { Search } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/search/__fixtures__/examples/basic.tsx" title="基础 Search" description="默认 round Search 适合列表和页面内过滤。"></code>

<code src="../../../src/search/**fixtures**/examples/square.tsx" title="Square Search" description="使用 shape=\"square\" 渲染方角搜索框。"></code>

<code src="../../../src/search/__fixtures__/examples/disabled.tsx" title="禁用状态" description="禁用状态保留内容展示，但不响应输入和清除操作。"></code>

<code src="../../../src/search/__fixtures__/examples/controlled.tsx" title="受控 Search" description="通过 value 和 onChange 管理受控搜索关键词。"></code>

<code src="../../../src/search/__fixtures__/examples/contact.tsx" title="联系人搜索" description="与 Navbar 组合，展示联系人搜索入口。"></code>

<code src="../../../src/search/__fixtures__/examples/height40.tsx" title="高度 40" description="让容器和真实输入区域同步使用 height={40}。"></code>

<code src="../../../src/search/__fixtures__/examples/prefix.tsx" title="Prefix" description="使用 prefix 替换默认搜索图标。"></code>

<code src="../../../src/search/__fixtures__/examples/suffix.tsx" title="Suffix" description="使用 suffix 放置自定义操作。"></code>

<code src="../../../src/search/__fixtures__/examples/multiline.tsx" title="Multiline" description="多行输入时让 Search 随 IM 内容增长。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string` | — | 受控搜索关键词 |
| defaultValue | `string` | `''` | 非受控初始搜索关键词 |
| onChange | `(value: string) => void` | — | 文本变化和清除时回调 |
| onChangeText | React Native `TextInputProps['onChangeText']` | — | 与原生 TextInput 对齐的文本变化回调 |
| placeholder | `string` | — | 占位文本 |
| disabled | `boolean` | `false` | 禁止输入、聚焦和清除，并应用 disabled token |
| readOnly | `boolean` | `false` | 禁止编辑，但保留内容和搜索框展示 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 搜索框高度 |
| shape | `'square' \| 'round'` | `'round'` | 方角或胶囊形状 |
| background | `ColorValue` | Search token | 覆盖搜索容器背景色；主题默认值仍来自 token |
| height | `number` | size token | 自定义搜索框最小/固定高度；单行同步到真实输入区域，多行作为最小高度 |
| prefix | `ReactNode` | `leftIcon` 或 Search icon | 前置布局区域；优先级高于 `leftIcon` |
| leftIcon | `ReactNode` | Search icon | 自定义左侧图标，Search 只负责布局 |
| suffix | `ReactNode` | 有值时的 clear icon | 后置布局区域；传入后不显示默认清除按钮 |
| showClear | `boolean` | `true` | 是否在有值时显示清除按钮 |
| onClear | `() => void` | — | 清除完成后的回调 |
| style | `StyleProp<ViewStyle>` | — | Search root 节点样式 |
| styles | `SearchStyles` | — | `root`、`container`、`prefix`、`suffix`、`input`、`clear` 语义样式；`leftIcon` 保留为兼容别名 |

Search 继承 React Native `TextInputProps` 的键盘、选择、可访问性和提交事件属性，但由组件管理 `value`、`defaultValue`、`onChange`、`onChangeText`、`style`、`editable` 和 `multiline`。单行模式会同步固定输入区域高度并关闭 Android font padding；`multiline` 模式不固定 `TextInput` 高度，`height` 只作为初始最小高度，适合 IM 输入自动增长。通过 ref 可以调用原生输入框的 `focus`、`blur` 和 `clear`。

清除按钮使用 `InteractionPressable` 和 `CloseCircleFilled`，视觉尺寸为 clear token，点击区域至少为 32px，提供统一 pressed feedback，并按顺序触发 `onChange('')`、`onChangeText('')` 和 `onClear()`。传入 `suffix` 后由调用方接管后置区域，不再显示默认清除按钮。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Search` 覆盖 Search token。所有默认颜色、尺寸、字号、圆角和禁用/按下状态都来自 Search component token；暗色主题会从当前 alias token 派生对应颜色。

```tsx | pure
import { ConfigProvider, Search } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    components: {
      Search: {
        search_background_color: '#f2f3f5',
        search_height_medium: 40,
      },
    },
  }}
>
  <Search placeholder="搜索联系人姓名/工号" />
</ConfigProvider>
```
