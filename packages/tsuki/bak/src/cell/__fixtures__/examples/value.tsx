import { Cell } from '../../..'

/**
 * @title Value
 * @description A Cell with a right-aligned value.
 */
export default function CellValueFixture() {
  return (
    <Cell.Group border={false}>
      <Cell value="只有 value" />
      <Cell title="账号" value="已绑定" />
    </Cell.Group>
  )
}
