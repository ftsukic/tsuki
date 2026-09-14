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

Search 是面向列表过滤和搜索入口的单行输入组件。它组合 `Input` 提供输入、清除、禁用、只读和原生 TextInput 能力，自己负责搜索场景的外层布局、搜索图标、形状和搜索行为。

</section>

<code src="../../../src/search/__fixtures__/overview.tsx" title="组件预览" description="Search 汇总 Vant 风格输入、左右扩展和搜索行为场景。"></code>

## 引入

```tsx | pure
import { Search } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/search/__fixtures__/examples/basic.tsx" title="基础 Search" description="默认方角 Search 只显示输入区域。"></code>

<code src="../../../src/search/__fixtures__/examples/action.tsx" title="外部操作" description="通过 action 放置取消等外部操作。"></code>

<code src="../../../src/search/__fixtures__/examples/align.tsx" title="输入对齐" description="将输入文字和占位文字居中对齐。"></code>

<code src="../../../src/search/__fixtures__/examples/disabled.tsx" title="禁用状态" description="禁用状态由 Input 负责输入状态和视觉。"></code>

<code src="../../../src/search/__fixtures__/examples/background.tsx" title="自定义背景" description="自定义 Search 外层背景，输入区域保持独立底色。"></code>

<code src="../../../src/search/__fixtures__/examples/label.tsx" title="内部 Label" description="在默认搜索图标后放置地址等内部内容。"></code>

<code src="../../../src/search/__fixtures__/examples/button-action.tsx" title="Button 操作" description="使用 Button 作为 Search 外部操作区。"></code>

<code src="../../../src/search/__fixtures__/examples/left.tsx" title="Left 和 Action" description="自定义外部 left 并组合返回箭头和按钮。"></code>

<code src="../../../src/search/__fixtures__/examples/action-extra.tsx" title="组合操作" description="action 可以组合多个按钮或图标节点。"></code>

<code src="../../../src/search/__fixtures__/examples/controlled.tsx" title="受控 Search" description="通过 value 和 onChange 管理受控搜索关键词。"></code>

<code src="../../../src/search/__fixtures__/examples/auto-search.tsx" title="自动搜索" description="输入停止后通过 debounce 触发最新搜索。"></code>

<code src="../../../src/search/**fixtures**/examples/square.tsx" title="Square Search" description="使用 shape=\"square\" 渲染小圆角搜索框。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string` | — | 受控搜索关键词 |
| defaultValue | `string` | `''` | 非受控初始搜索关键词 |
| placeholder | `string` | — | 占位文本 |
| onChange | `(value: string) => void` | — | 文本变化和清除时回调 |
| disabled | `boolean` | `false` | 交给 Input 禁止编辑和清除 |
| readOnly | `boolean` | `false` | 交给 Input 禁止编辑但保留普通视觉 |
| clearable | `boolean` | `true` | 是否启用 Input 的清除能力 |
| clearTrigger | `'always' \| 'focus'` | `'always'` | Input 清除按钮的显示时机 |
| shape | `'square' \| 'round'` | `'square'` | 输入区域的小圆角或胶囊圆角 |
| background | `ColorValue` | Search token | Search 整体外层背景色 |
| inputAlign | `'left' \| 'center' \| 'right'` | `'left'` | 输入文字和占位文字对齐方式 |
| searchIcon | `ReactNode` | `SearchOutlined` | 输入区域内的默认搜索图标 |
| label | `ReactNode` | — | 搜索图标后的输入区域内容 |
| suffix | `ReactNode` | — | 输入区域内部右侧内容 |
| left | `ReactNode` | — | Search 外部左侧扩展区域 |
| action | `ReactNode` | — | Search 外部右侧操作区域 |
| onSearch | `(value: string) => void` | — | 键盘提交或自动搜索 intent；开启 `autoSearch` 时也用于 debounce 后的搜索 |
| autoSearch | `boolean` | `false` | 是否在输入变化后自动搜索 |
| debounce | `number` | `300` | 自动搜索的延迟毫秒数 |
| style | `StyleProp<ViewStyle>` | — | Search root 节点样式 |
| styles | `SearchStyles` | — | `root`、`left`、`content`、`prefix`、`label`、`input`、`suffix`、`clear`、`action` 语义样式 |

Search 继承 Input 支持的原生 TextInput props，包括键盘、选择、可访问性、`editable` 和提交事件属性，但始终保持单行。`multiline`、`height`、`leftIcon` 不属于 Search API；IM 或自动增高输入请直接使用 `<Input multiline autoSize />`。

通过 ref 可以调用底层原生输入框的 `focus`、`blur` 和 `clear`。`onSearch` 提交时读取 Input 当前值；开启 `autoSearch` 后，连续输入只会在 debounce 后触发最后一次搜索，提交会取消待执行的自动搜索。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Search` 覆盖 Search token。`search_background_color` 控制外层背景，`search_content_background_color` 控制内部输入区域背景。

```tsx | pure
import { ConfigProvider, Search } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    components: {
      Search: {
        search_background_color: '#ffffff',
        search_content_background_color: '#f2f3f5',
      },
    },
  }}
>
  <Search placeholder="搜索联系人姓名/工号" />
</ConfigProvider>
```
