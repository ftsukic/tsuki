/**
 * @title Group Inset
 * @description Insets a group of related rows.
 */

import { Cell } from '@ftsukic/tsuki'

export default function GroupInset() {
  return (
    <Cell.Group inset title="Profile">
      <Cell title="Name" value="Taylor" />
      <Cell title="Email" showArrow />
    </Cell.Group>
  )
}
