/**
 * @title Group
 * @description Groups related settings rows.
 */

import { Cell, CellGroup } from '@ftsukic/tsuki'

export default function Group() {
  return (
    <CellGroup>
      <Cell title="Account" />
      <Cell title="Privacy" />
    </CellGroup>
  )
}
