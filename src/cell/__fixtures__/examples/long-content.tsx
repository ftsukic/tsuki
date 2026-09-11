import { Cell } from '../../..'

/**
 * @title Long content
 * @description title/value 都可以多行，使用 titleLines/valueLines 控制 primitive Text。
 */
export default function CellLongContentFixture() {
  return (
    <Cell
      title="这是一段需要收缩的较长标题"
      titleLines={2}
      value="这是一段需要收缩的较长值内容"
      valueLines={2}
    />
  )
}
