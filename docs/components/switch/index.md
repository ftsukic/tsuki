---
title: Switch 开关
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Switch 开关

<section className="component-doc-intro">

## 介绍

Switch 用于在打开和关闭状态之间进行切换，支持受控、非受控、自定义值、异步切换确认、禁用和加载状态。

</section>

<code src="../../../src/switch/__fixtures__/overview.tsx" title="组件预览" description="Switch 的状态、尺寸、自定义颜色和异步确认示例。"></code>

## 引入

```tsx | pure
import { Switch } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/switch/__fixtures__/examples/states.tsx" title="状态和尺寸" description="展示默认、checked、disabled、loading 以及 small、medium、large 尺寸。"></code>

<code src="../../../src/switch/__fixtures__/examples/colors.tsx" title="自定义颜色" description="通过 activeColor 和 inactiveColor 定制轨道颜色。"></code>

<code src="../../../src/switch/__fixtures__/examples/before-change.tsx" title="异步确认" description="beforeChange 返回 Promise，在确认完成前不提交新的开关值。"></code>

<code src="../../../src/switch/__fixtures__/examples/semantic.tsx" title="语义样式" description="自定义轨道与滑块尺寸、状态背景及加载区域。"></code>

## API

### Switch

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `ActiveValueT \| InactiveValueT` | — | 受控值；等于 `activeValue` 时表示开启，否则表示关闭 |
| defaultValue | `ActiveValueT \| InactiveValueT` | `inactiveValue` | 非受控初始值 |
| loading | `boolean` | `false` | 在 thumb 中显示 Loading，并禁止切换 |
| disabled | `boolean` | `false` | 禁止点击并应用 disabled opacity |
| size | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 预设尺寸或有限正数自定义高度；无效数字回退到 medium。预设尺寸分别为 `32×20`、`44×24`、`52×32` |
| activeColor | `ColorValue` | `colorPrimary` | 开启时的轨道颜色 |
| inactiveColor | `ColorValue` | `colorFillSecondary` | 关闭时的轨道颜色 |
| activeValue | `ActiveValueT` | `true` | 开启时通过 `onChange` 输出的值 |
| inactiveValue | `InactiveValueT` | `false` | 关闭时通过 `onChange` 输出的值 |
| onPress | `() => void` | — | 有效点击后、beforeChange 执行前调用 |
| onChange | `(value) => void` | — | 切换确认通过后调用；受控模式下由父组件更新 `value` |
| beforeChange | `(value) => boolean \| Promise<boolean>` | — | 返回 `false` 或解析为 `false` 时取消切换 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式 |
| styles | `SwitchStyles` | — | `root`、`track`、`indicator`、`loading` 语义样式；支持对象或函数。 |

`Switch` 继承 React Native `PressableProps`，但由组件管理 `children`、`style`、`disabled` 和 `onPress`。根节点使用 `accessibilityRole="switch"`，并同步 `checked`、`disabled` 和 `busy` 无障碍状态。`loading` 与 `disabled` 都会阻止点击。

数字 `size` 按 `width = size * 2`、`height = size` 计算，thumb 的宽高为 `size - 4`；预设尺寸使用明确的 Vant 风格移动端几何值。轨道默认动画时长为 200ms，thumb 使用统一 spring，并遵循主题的 `motion` 设置。

### 语义结构和样式优先级

结构为 `root → track → indicator → loading`。`indicator` 表示可移动滑块，`loading` 仅在加载时出现，作用于滑块内部的 Loading 根容器。

| 区域        | 职责                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| `root`      | 交互、外部布局、禁用透明度；`style` 优先于 `styles.root`                  |
| `track`     | 轨道尺寸、圆角和背景；`backgroundColor` 覆盖 active/inactive 颜色及其插值 |
| `indicator` | 滑块尺寸与外观；组件平移与调用方 `transform` 组合                         |
| `loading`   | 加载区域的布局和背景；不直接设置内部 spinner 的颜色                       |

默认尺寸由 `size` 和组件 token 决定。通过语义样式调整轨道或滑块宽度时，平移距离跟随实际布局更新；滑块右侧默认保留 `thumbInset`。调用方 transform 在组件平移之后组合，布局测量不把视觉缩放或旋转当作尺寸变化。不承诺对任意旋转、缩放或绝对定位自动校正边缘。外部布局请使用根节点样式。

函数形式的 `styles` 接收 props 与 `active / disabled / loading / pressed / hovered / size` 状态，支持按状态改变样式。

### 受控和非受控

```tsx | pure
const [enabled, setEnabled] = useState(false)

<Switch value={enabled} onChange={setEnabled} />
<Switch defaultValue />
```

`value` 存在时组件不会自行改变视觉状态，只会在切换确认后调用 `onChange`。未传入 `value` 时，组件内部保存切换后的状态。

### 自定义值和异步确认

连续确认只接受最新请求。等待期间当前值、`activeValue / inactiveValue` 或受控模式发生变化，进入 `disabled / loading`，或组件卸载，旧请求会失效；即使值或交互状态随后恢复，也不会重新提交。有效确认通过时使用最新的 `onChange`。

`beforeChange` 返回或解析为 `false`，以及 Promise 拒绝时，均取消切换。等待确认本身不会自动进入 loading。将 loading 设为 true 会取消待确认请求，因此不要在希望继续提交的同一次确认中用 loading 表示等待；需要等待提示时可在开关外显示状态。

```tsx | pure
<Switch
  activeValue="enabled"
  inactiveValue="disabled"
  defaultValue="disabled"
  beforeChange={async (nextValue) => {
    const allowed = await confirmChange(nextValue)
    return allowed
  }}
  onChange={(nextValue) => saveValue(nextValue)}
/>
```

## Token

通过 `ConfigProvider` 的 `theme.components.Switch` 覆盖组件 token：

| Token | 默认来源 | 说明 |
| --- | --- | --- |
| `smallWidth` / `smallHeight` | `32` / `20` | small 预设尺寸 |
| `mediumWidth` / `mediumHeight` | `44` / `24` | medium 预设尺寸 |
| `largeWidth` / `largeHeight` | `52` / `32` | large 预设尺寸 |
| `thumbInset` | `2` | thumb 与轨道边缘的间距 |
| `activeColor` | `colorPrimary` | 默认开启颜色 |
| `inactiveColor` | `colorFillSecondary` | 默认关闭颜色 |
| `thumbColor` | `colorWhite` | thumb 颜色 |
| `loadingColor` | `colorIcon` | loading 指示器颜色 |
| `disabledOpacity` | Button disabled opacity | 禁用透明度 |
| `pressedOpacity` | `pressedOpacity` | pressed 反馈透明度；移动端不由 hovered 触发 |
| `animationDuration` | `motionDurationMid` | 轨道颜色动画时长 |

```tsx | pure
import { ConfigProvider, Switch } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    components: {
      Switch: {
        activeColor: '#07C160',
        inactiveColor: '#DCDEE0',
      },
    },
  }}
>
  <Switch defaultValue />
</ConfigProvider>
```

组件不使用 React Native `Switch`，不提供 Web DOM 属性、`checked/defaultChecked` 别名或自定义 thumb children API。

## 动画

轨道颜色使用 timing 插值，thumb 使用统一 normal spring 平移。`animationDuration` 控制轨道时长，物理 spring 由预设决定；遵循 `TsukiProvider motion`，关闭或 Reduced Motion 时即时切换。
