import { Cell } from '../../..'

/**
 * @title Horizontal
 * @description horizontal Cell 中 title 按内容占位，value 使用剩余空间并默认右对齐。
 */
export default function CellHorizontalFixture() {
  return (
    <Cell.Group border={false}>
      <Cell title="单元格" value="1内容内容内容内容内容内容内容1内2" />
      <Cell title="可省略" value="1内容内容内容内容内容内容内容内容..." valueLines={1} />
      <Cell
        title="多行可省略多行可省略"
        titleLines={1}
        value="1内容内容内容内容内容内容内容内容内容内容内容内容..."
        valueLines={2}
      />
    </Cell.Group>
  )
}
