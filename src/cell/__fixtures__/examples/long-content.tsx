import { Cell } from '../../..'

/**
 * @title Long content
 * @description title/value 都可以多行，使用 titleLines/valueLines 控制 primitive Text。
 */
export default function CellLongContentFixture() {
  return (
    <Cell.Group border={false}>
      <Cell
        title="这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题"
        titleLines={1}
      />
      <Cell
        title="这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题"
        titleLines={2}
        isLink
      />
      <Cell
        title="标题"
        value="这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题"
        valueLines={1}
        isLink
      />
      <Cell
        title="标题"
        value="这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题"
        valueLines={2}
        isLink
      />
      <Cell
        title="这是标题"
        titleLines={3}
        value="这是一段需要收缩的较长值内容这是一段需要收缩的较长值内容这是一段需要收缩的较长值内容"
        valueLines={3}
        isLink
      />
      <Cell
        title="这是一段需要收缩的较长标题这是一段需要收缩的较长标题这是一段需要收缩的较长标题"
        titleLines={3}
        value="这是一段需要收缩的较长值内容这是一段需要收缩的较长值内容这是一段需要收缩的较长值内容"
        valueLines={3}
        isLink
      />
    </Cell.Group>
  )
}
