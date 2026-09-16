import { Cell } from '../../..'

/**
 * @title Disabled
 * @description Disabled is a library extension for preventing interaction.
 */
export default function CellDisabledFixture() {
  return (
    <Cell.Group border={false}>
      <Cell title="普通 Cell" value="不可用" disabled />
      <Cell title="链接 Cell" value="不可用" isLink disabled />
    </Cell.Group>
  )
}
