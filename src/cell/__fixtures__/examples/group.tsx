import { Cell } from '../../..'

/**
 * @title CellGroup
 * @description A group body without a title.
 */
export default function CellGroupFixture() {
  return (
    <Cell.Group>
      <Cell title="账号" value="已绑定" />
      <Cell title="通知" value="已开启" />
    </Cell.Group>
  )
}
