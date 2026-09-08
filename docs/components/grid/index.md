---
title: Grid
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Grid 栅格

<code src="../../../src/grid/__fixtures__/overview.tsx"></code>

Grid 是面向移动端的图标文字网格，语义对齐 Vant Mobile。旧的 `Row` / `Col` 24 栅格 Layout API 仍然保留，适合页面布局。

```text
import { Grid, Icon } from '@ftsukic/tsuki';

<Grid columnNum={4} gutter={12} square border center>
  <Grid.Item icon={<Icon name="MessageOutlined" />} text="聊天" />
  <Grid.Item icon={<Icon name="FileOutlined" />} text="文件" />
</Grid>;
```

## Grid

| 属性      | 类型        | 默认值  | 说明                                                         |
| --------- | ----------- | ------- | ------------------------------------------------------------ |
| columnNum | `number`    | `4`     | 每行列数；内部换算为 `24 / columnNum` 的 Layout `Col.span`。 |
| gutter    | `number`    | `0`     | Grid Item 的横向和纵向间距。                                 |
| square    | `boolean`   | `false` | 让每个 Grid Item 保持正方形。                                |
| border    | `boolean`   | `true`  | 显示 Grid Item 边框。                                        |
| center    | `boolean`   | `true`  | 将图标和文字居中排列；关闭后使用起始对齐。                   |
| children  | `ReactNode` | —       | `Grid.Item` 子项。                                           |

### Grid.Item

| 属性     | 类型                   | 默认值 | 说明                              |
| -------- | ---------------------- | ------ | --------------------------------- |
| icon     | `ReactNode`            | —      | 图标或头像节点。                  |
| text     | `ReactNode`            | —      | 图标下方的文字或自定义节点。      |
| children | `ReactNode`            | —      | 自定义内容；设置后优先于 `text`。 |
| style    | `StyleProp<ViewStyle>` | —      | Grid Item 根 View 样式。          |

Grid 与 Grid.Item 都继承对应的 React Native View 属性；Grid Item 的 `border`、`center`、`square` 由 Grid 上下文统一控制。

## Layout Row / Col 兼容 API

```tsx
import { Col, Row } from '@ftsukic/tsuki'

;<Row gap={16}>
  <Col span={8}>第一列</Col>
  <Col span={8}>第二列</Col>
  <Col span={8}>第三列</Col>
</Row>
```

`Row` 支持 `gap`、`justify` 和 `align`，并继承 React Native `ViewProps`。`gap` 会通过上下文传递给内部 `Col`，每个列使用一半间距作为上下左右内边距，因此换行后的行之间也会保持相同间距。

`Col` 必须设置 `span`，取值表示占用 24 栅格中的列数；`offset` 表示左侧偏移的栅格数，默认为 `0`。`Col` 同样继承 React Native `ViewProps`。

`Col` 建议放在 `Row` 内使用，这样才能获得 `Row` 配置的间距；组件的 `style` 会覆盖默认布局样式。Row / Col 的内部实现位于 `src/layout`，旧的 `src/grid` 导出继续有效。
