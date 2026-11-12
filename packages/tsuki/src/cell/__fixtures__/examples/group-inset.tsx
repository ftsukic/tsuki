import { Cell } from '../../..'

/**
 * @title CellGroup inset
 * @description An inset CellGroup body with the Vant rounded container treatment.
 */
export default function CellGroupInsetFixture() {
  return (
    <Cell.Group title="账户信息" inset>
      <Cell title="昵称" value="Altron" />
      <Cell title="地区" value="上海" />
    </Cell.Group>
  )
}
