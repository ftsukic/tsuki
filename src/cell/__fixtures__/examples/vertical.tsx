import { Cell, Text } from '../../..'

/**
 * @title Vertical
 * @description vertical 只改变 Main 内 title/value 的排列，arrow 和 extra 仍在右侧。
 */
export default function CellVerticalFixture() {
  return (
    <Cell
      vertical
      title="备注"
      titleExtra={<Text>选填</Text>}
      label="给收件人的说明"
      value="这是一段较长的补充内容"
      valueExtra={<Text>字</Text>}
      extra={<Text>编辑</Text>}
      isLink
    />
  )
}
