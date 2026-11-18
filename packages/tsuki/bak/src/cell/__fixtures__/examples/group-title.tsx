import { Cell } from '../../..'

/**
 * @title CellGroup title
 * @description A title rendered above the CellGroup body.
 */
export default function CellGroupTitleFixture() {
  return (
    <Cell.Group title="账户信息">
      <Cell title="昵称" value="Altron" />
      <Cell title="地区" value="上海" />
    </Cell.Group>
  )
}
