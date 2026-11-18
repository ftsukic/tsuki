# Surface

Surface 为内容提供背景、圆角、内边距、边框和裁剪。Card 可在 Surface 上组织 Header、Body 和 Footer，布局与交互由调用方决定。

```tsx
import { Surface, Text } from '@ftsukic/tsuki'

export function Example() {
  return (
    <Surface bordered inset>
      <Text>外层内容</Text>
      <Surface padding={8} radius={6}>
        <Text>内层内容</Text>
      </Surface>
    </Surface>
  )
}
```

| Prop          | 类型                    | 默认值                                               |
| ------------- | ----------------------- | ---------------------------------------------------- |
| `background`  | `ColorValue`            | `semantic.colorSurface`                              |
| `radius`      | `number`                | `components.Surface.borderRadius`，12 dp             |
| `padding`     | `number`                | `components.Surface.padding`，16 dp                  |
| `bordered`    | `boolean`               | `false`                                              |
| `borderColor` | `ColorValue`            | `semantic.colorBorder`                               |
| `borderWidth` | `number`                | `components.Surface.borderWidth`，设备 hairline      |
| `inset`       | `boolean`               | `false`。启用后使用主题 padding token 作为水平外边距 |
| `overflow`    | `ViewStyle['overflow']` | `hidden`                                             |
| `className`   | `string`                | —，应用于根 View                                     |
| `style`       | `ViewProps['style']`    | —，应用于根 View                                     |

`borderColor` 和 `borderWidth` props 只在启用 `bordered` 时应用。类名和原生样式可以单独设置边框。其它 View props 和子节点直接传给根 View。

使用 `TsukiProvider` 或嵌套 `ConfigProvider` 覆盖 `semantic.colorSurface`、`semantic.colorBorder` 或 `components.Surface`。局部主题继承外层配置，`inherit: false` 恢复当前 scheme 的默认值。静态 CSS 为边框厚度提供 1 CSS 像素回退，原生默认值按设备密度计算。

NativeWind v4/v5 的常规样式优先级为 **主题 → props → 类名 → 原生样式**。`!important` 工具类遵循 CSS 优先级。Playground 使用原生样式回退，类名效果可在两套 NativeWind Consumer 中预览。

- [全部示例](../../../../packages/tsuki/src/surface/__fixtures__/overview.tsx)
- [主题覆盖](../../../../packages/tsuki/src/surface/__fixtures__/examples/theme.tsx)
- [类名覆盖](../../../../packages/tsuki/src/surface/__fixtures__/examples/custom-class.tsx)
