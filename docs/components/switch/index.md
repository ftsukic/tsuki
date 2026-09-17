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

## API

### Switch

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `ActiveValueT \| InactiveValueT` | — | 受控值；等于 `activeValue` 时表示开启，否则表示关闭 |
| defaultValue | `ActiveValueT \| InactiveValueT` | `inactiveValue` | 非受控初始值 |
| loading | `boolean` | `false` | 在 thumb 中显示 Loading，并禁止切换 |
| disabled | `boolean` | `false` | 禁止点击并应用 disabled opacity |
| size | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 预设尺寸或数字自定义高度；预设尺寸分别为 `32×20`、`44×24`、`52×32` |
| activeColor | `ColorValue` | `colorPrimary` | 开启时的轨道颜色 |
| inactiveColor | `ColorValue` | `colorFillSecondary` | 关闭时的轨道颜色 |
| activeValue | `ActiveValueT` | `true` | 开启时通过 `onChange` 输出的值 |
| inactiveValue | `InactiveValueT` | `false` | 关闭时通过 `onChange` 输出的值 |
| onPress | `() => void` | — | 有效点击后、beforeChange 执行前调用 |
| onChange | `(value) => void` | — | 切换确认通过后调用；受控模式下由父组件更新 `value` |
| beforeChange | `(value) => boolean \| Promise<boolean>` | — | 返回 `false` 或解析为 `false` 时取消切换 |
| style | `StyleProp<ViewStyle>` | — | 根 Pressable 样式 |
| styles | `SwitchStyles` | — | `root`、`track`、`thumb`、`loading` 语义样式 |

`Switch` 继承 React Native `PressableProps`，但由组件管理 `children`、`style`、`disabled` 和 `onPress`。根节点使用 `accessibilityRole="switch"`，并同步 `checked`、`disabled` 和 `busy` 无障碍状态。`loading` 与 `disabled` 都会阻止点击。

数字 `size` 按 `width = size * 2`、`height = size` 计算，thumb 的宽高为 `size - 4`；预设尺寸使用明确的 Vant 风格移动端几何值。默认动画时长为 200ms，并遵循主题的 `motion` 设置。

### 受控和非受控

```tsx | pure
const [enabled, setEnabled] = useState(false)

<Switch value={enabled} onChange={setEnabled} />
<Switch defaultValue />
```

`value` 存在时组件不会自行改变视觉状态，只会在切换确认后调用 `onChange`。未传入 `value` 时，组件内部保存切换后的状态。

### 自定义值和异步确认

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
| `animationDuration` | `motionDurationMid` | thumb 动画时长 |

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
