import { Cell, Text } from '../../..'

/**
 * @title Vertical
 * @description vertical 只改变 Main 内 title/value 的排列，arrow 和 extra 仍在右侧。
 */
export default function CellVerticalFixture() {
  return (
    <>
      <Cell vertical title="垂直布局标题" value="垂直布局value" />
      <Cell
        vertical
        title="垂直布局标题 "
        valueAlign="center"
        value="调整value位置 center"
        isLink
      />
      <Cell vertical title="垂直布局标题 " valueAlign="right" value="调整value位置 right" isLink />
      <Cell
        required
        vertical
        title="垂直布局标题 "
        valueAlign="left"
        value="垂直布局value"
        isLink
      />
      <Cell
        vertical
        title="备注"
        titleExtra={'选填'}
        label="给收件人的说明"
        value="value：这是一段较长的补充内容"
        valueExtra={'这是ValueExtra'}
        extra={'额外'}
        isLink
      />
      <Cell
        vertical
        title="备注"
        titleExtra={<Text size="normal">自定义节点</Text>}
        label="给收件人的说明"
        value="value：这是一段较长的补充内容"
        valueExtra={<Text>这是ValueExtra</Text>}
        extra={<Text>Extra</Text>}
        isLink
      />
    </>
  )
}
