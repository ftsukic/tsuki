import { Cell } from '../../..'

/**
 * @title Divider
 * @description Use the explicit divider override for standalone and custom Cell layouts.
 */
export default function CellDividerFixture() {
  return (
    <>
      <Cell title="单独 Cell" />
      <Cell divider title="手动显示 divider" />
      <Cell divider title="第一项" />
      <Cell title="最后一项" />
      <Cell.Group border={false}>
        <Cell title="推荐列表第一项" />
        <Cell title="推荐列表最后一项" />
      </Cell.Group>
    </>
  )
}
