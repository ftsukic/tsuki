# Card

Card 用于组织内容，可直接接收子节点，也可使用 `Card.Header`、`Card.Body` 和 `Card.Footer`。各区域可选，并按传入顺序参与布局。

```tsx
import { Button, Card, Text } from '@ftsukic/tsuki'

export function Details() {
  return (
    <Card bordered>
      <Card.Header padding={8}>
        <Text>项目详情</Text>
      </Card.Header>
      <Card.Body>
        <Text>项目说明</Text>
      </Card.Body>
      <Card.Footer>
        <Button>保存</Button>
      </Card.Footer>
    </Card>
  )
}
```

根节点复用 Surface，支持 [Surface 的视觉属性](../surface/index.md) 和 React Native ViewProps。`radius`、`padding` 和 `gap` 默认使用 Card token。各区域渲染 View，接受 ViewProps、`padding`、`className` 和 `style`。根 padding 与区域 padding 叠加，直接子节点只使用根 padding。

`components.Card` 提供 `borderRadius`（12 dp）、`padding`（16 dp）、`headerPadding`（16 dp）、`bodyPadding`（16 dp）、`footerPadding`（16 dp）和 `gap`（0 dp）。颜色来自 Surface 的语义主题。可在 TsukiProvider 或 ConfigProvider 中覆盖，`inherit: false` 恢复当前 scheme 的默认值。

NativeWind v4/v5 的常规样式按 **主题 → props → 类名 → 原生 `style`** 合并。`!important` 工具类遵循 CSS 优先级。Playground 使用原生样式回退，类名效果可在两套 Consumer 中预览。

- [简洁模式](../../../../packages/tsuki/src/card/__fixtures__/examples/basic.tsx)
- [全部示例](../../../../packages/tsuki/src/card/__fixtures__/overview.tsx)
- [局部主题](../../../../packages/tsuki/src/card/__fixtures__/examples/theme.tsx)
