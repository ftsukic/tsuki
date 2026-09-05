---
title: Grid
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Grid

<code src="./__fixtures__/basic.tsx"></code>

Grid 提供基于 24 栅格的行列布局，适合实现按钮组、表单项和响应式卡片排列。

```text
import { Col, Row } from '@ftsukic/react-native-ui';

<Row gap={16}>
  <Col span={8}>第一列</Col>
  <Col span={8}>第二列</Col>
  <Col span={8}>第三列</Col>
</Row>;
```

`Row` 支持 `gap`、`justify` 和 `align`，并继承 React Native `ViewProps`。`gap` 会通过上下文传递给内部 `Col`，每个列使用一半间距作为左右内边距。

`Col` 必须设置 `span`，取值表示占用 24 栅格中的列数；`offset` 表示左侧偏移的栅格数，默认为 `0`。`Col` 同样继承 React Native `ViewProps`。

`Col` 建议放在 `Row` 内使用，这样才能获得 `Row` 配置的间距；组件的 `style` 会覆盖默认布局样式。
