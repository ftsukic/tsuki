---
title: Loading
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Loading

<section className="component-doc-intro">

## 介绍

Loading 用于表示正在进行的异步操作，提供 Vant 风格的 `circular` 缺口圆环和 `spinner` 径向条段两种指示器。

</section>

<code src="../../../src/loading/__fixtures__/overview.tsx" title="组件预览" description="Loading 的类型、尺寸、文字、布局和主题样式预览。"></code>

## 引入

```tsx | pure
import { Loading } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/loading/__fixtures__/examples/basic.tsx" title="基础用法" description="使用默认 token 渲染 circular Loading。"></code>

<code src="../../../src/loading/__fixtures__/examples/type.tsx" title="指示器类型" description="比较 circular 缺口圆环和 spinner 径向条段。"></code>

<code src="../../../src/loading/__fixtures__/examples/size-color.tsx" title="尺寸和颜色" description="使用同一组 size 和 color API 定制两种指示器。"></code>

<code src="../../../src/loading/__fixtures__/examples/text.tsx" title="带文字" description="在指示器右侧显示加载文字。"></code>

<code src="../../../src/loading/__fixtures__/examples/vertical.tsx" title="垂直布局" description="使用 vertical 将指示器和文字上下排列。"></code>

<code src="../../../src/loading/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="通过 Loading token 和 semantic styles 定制组件。"></code>

## API

### Loading

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'circular' \| 'spinner'` | `'circular'` | 指示器类型；`circular` 是带缺口的 SVG 圆环，`spinner` 是多个径向条段 |
| size | `number` | `Loading token.defaultSize` | 指示器直径，必须为正数；无效值回退到 token |
| color | `ColorValue` | `Loading token.defaultColor` | 指示器颜色 |
| duration | `number` | `Loading token.animationDuration` | 旋转一周的时长，单位为毫秒；有限值按 `max(0, value)` 处理，0 或负值不启动动画，无效值回退到 token |
| vertical | `boolean` | `false` | 是否将指示器和文字上下排列 |
| children | `ReactNode` | — | 加载文字或自定义 React 节点；字符串和数字使用库内 `Text` 渲染 |
| textColor | `ColorValue` | `Loading token.textColor` | `children` 为字符串或数字时的文字颜色 |
| textSize | `number` | `Loading token.textFontSize` | `children` 为字符串或数字时的字号，必须为正数 |
| style | `StyleProp<ViewStyle>` | — | Loading 根节点样式，优先级高于默认样式和 `styles.root` |
| styles | `LoadingStyles` | — | `root`、`indicator`、`text` 三个语义样式插槽；也支持函数形式 |

Loading 根节点使用无障碍 `progressbar` 角色，并将 `accessibilityState.busy` 设为 `true`。`style` 只作用于根节点；`styles.indicator` 作用于指示器容器，`styles.text` 作用于 primitive `children` 的库内 `Text` 节点。

`circular` 通过 `react-native-svg` 的 `Circle` 和 `strokeDasharray` 绘制缺口圆环；`spinner` 通过八个径向条段绘制，静态外观与 `circular` 不同。两者共享 `size`、`color`，并在主题 `motion` 开启时旋转；`theme.token.motion=false` 时不会启动持续动画。

动画时长默认由 `Loading` component token 的 `animationDuration` 控制，也可通过 `duration` 覆盖；0 或负值不启动动画。

### Loading token

通过 `ConfigProvider` 的 `theme.components.Loading` 覆盖默认 token：

| Token               | 默认来源                          | 说明                       |
| ------------------- | --------------------------------- | -------------------------- |
| `defaultSize`       | `controlHeightSM - lineWidth * 2` | 默认指示器尺寸             |
| `defaultColor`      | `colorIcon`                       | 默认指示器颜色             |
| `textColor`         | `colorTextSecondary`              | primitive 文本颜色         |
| `textFontSize`      | `fontSizeSM`                      | primitive 文本字号         |
| `textGap`           | `marginXS`                        | 指示器和文本间距           |
| `animationDuration` | `1000`                            | 旋转一周的时长，单位为毫秒 |

```tsx | pure
import { ConfigProvider, Loading } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    components: {
      Loading: { defaultColor: '#7232DD', textGap: 8 },
    },
  }}
>
  <Loading>同步中</Loading>
</ConfigProvider>
```

Loading 继承 React Native `ViewProps`，但由组件管理 `children`、`style` 和 `accessibilityRole`。不提供 Web 专属 DOM 属性，也不提供 `active`、进度百分比或全屏遮罩 API。
