# Space

Space 为一组 React Native 子节点提供统一间距，适用于按钮组、图标与文字组合以及可换行的标签列表。

安装 `@ftsukic/tsuki` 后，从包入口导入 `Space` 和 `SpaceProps`。使用 `className` 时，配置对应版本的 Tsuki NativeWind 资源。纯 React Native 应用可直接使用布局 props 和原生样式。

```tsx
import { Space, Text } from '@ftsukic/tsuki'

export function Actions() {
  return (
    <Space gap={8}>
      <Text>编辑</Text>
      <Text>分享</Text>
    </Space>
  )
}
```

- [纵向排列](../../../../packages/tsuki/src/space/__fixtures__/examples/vertical.tsx)使用 `direction="vertical"`。
- [自动换行](../../../../packages/tsuki/src/space/__fixtures__/examples/wrap.tsx)使用 `wrap` 并限制容器尺寸。
- [Tailwind 布局](../../../../packages/tsuki/src/space/__fixtures__/examples/custom-class.tsx)用 `flex-col gap-4` 覆盖 Space 的方向与间距。Playground 使用原生布局，NativeWind 类名效果可在 v4/v5 Consumer 中预览。

| Prop        | 类型                         | 默认值       | 行为                       |
| ----------- | ---------------------------- | ------------ | -------------------------- |
| `direction` | `'horizontal' \| 'vertical'` | `horizontal` | 映射到 `flexDirection`     |
| `gap`       | `number`                     | 无额外间距   | 原生布局单位，支持动态更新 |
| `wrap`      | `boolean`                    | `false`      | 映射到 `flexWrap`          |
| `align`     | `FlexStyle['alignItems']`    | 原生默认值   | 设置交叉轴对齐             |
| `className` | `string`                     | —            | 根 View 的 NativeWind 类名 |
| `style`     | `ViewProps['style']`         | —            | 根 View 的原生样式         |

常规样式按 **默认布局 → Space props → NativeWind 类名 → 原生 `style`** 合并。NativeWind 的 `!important` 工具类仍遵循 CSS 优先级。其它 `ViewProps` 直接传给同一个根 View。

子节点直接参加原生布局，可使用 Fragment 或嵌套 Space。Space 负责方向、间距、换行和交叉轴对齐。主轴分布等复杂布局可使用 React Native View 的 Flexbox 样式。
