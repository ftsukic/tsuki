# Surface 视觉容器

## 介绍

Surface 是只负责视觉承载的主题背景、圆角和裁剪容器，不包含 Card 的 header、body、footer 语义。

- [组件预览：展示 Surface 与 CellGroup、Grid 的组合。](../../../src/surface/__fixtures__/overview.tsx)

## 引入

```tsx
import { Surface } from '@ftsukic/tsuki'
```

## 代码演示

- [Surface Mixed：在同一 Surface 中并列组合 CellGroup 和 Mobile Grid。](../../../src/surface/__fixtures__/examples/mixed.tsx)

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | Surface 内部内容。 |
| background | `ColorValue` | `colorBgContainer` | 背景颜色。 |
| radius | `number` | `borderRadiusLG` | 圆角半径。 |
| inset | `boolean` | `false` | 使用主题 `padding` 作为左右外间距。 |
| overflow | `'visible' \| 'hidden' \| 'scroll'` | `'hidden'` | 容器溢出行为；默认裁剪圆角内容。 |
| style | `StyleProp<ViewStyle>` | — | 追加到根 View 的样式。 |

Surface 继承 React Native `ViewProps`，并保留 `testID`、无障碍和布局属性。它不支持 Card 的 `header`、`body`、`footer` 等语义 API；需要 Cell 集合和 Grid 时，将它们作为并列子元素放入 Surface。
