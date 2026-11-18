# Divider

Divider 用于分隔横向或纵向排列的内容。从 `@ftsukic/tsuki` 导入 `Divider`、`DividerProps` 和 `DividerThemeTokens`。

```tsx
import { Divider, Space, Text } from '@ftsukic/tsuki'

export function Example() {
  return (
    <Space gap={8} style={{ height: 32 }}>
      <Text>编辑</Text>
      <Divider orientation="vertical" inset={4} />
      <Text>分享</Text>
    </Space>
  )
}
```

横向 Divider 用在纵向容器中，纵向 Divider 用在横向容器中。分隔线沿父容器交叉轴拉伸并扣除对应轴的外边距。在同轴布局中可用 `style` 指定长度。

| Prop          | 类型                         | 默认值                                      |
| ------------- | ---------------------------- | ------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal`                                |
| `color`       | `ColorValue`                 | 当前主题的 `semantic.colorBorder`           |
| `thickness`   | `number`                     | 当前主题的 `components.Divider.thickness`   |
| `inset`       | `number`                     | `0`，横向应用左右外边距，纵向应用上下外边距 |
| `className`   | `string`                     | —，作用于根 View                            |
| `style`       | `ViewProps['style']`         | —，作用于根 View                            |

默认厚度来自 React Native 的 `StyleSheet.hairlineWidth`，按设备像素密度计算。可用 `TsukiProvider` 设置应用主题，或用 `ConfigProvider` 局部覆盖 `theme.components.Divider.thickness`。设定 `inherit: false` 可恢复当前 scheme 默认值。

常规样式按 **主题默认值 → Divider props → NativeWind 类名 → 原生 `style`** 合并。NativeWind 的 `!important` 仍遵循 CSS 优先级。旧 Playground 使用原生布局回退，两套 NativeWind Consumer 展示类名覆盖。

默认无障碍角色为 `separator`，支持调用方提供 `role`、`accessibilityRole` 或 `accessible={false}`。默认 `pointerEvents="none"`，调用方可覆盖。其他 React Native View props 传给根节点。

- [基础与全部示例](../../../../packages/tsuki/src/divider/__fixtures__/overview.tsx)
- [主题覆盖](../../../../packages/tsuki/src/divider/__fixtures__/examples/theme.tsx)
- [NativeWind 类名覆盖](../../../../packages/tsuki/src/divider/__fixtures__/examples/custom-class.tsx)
