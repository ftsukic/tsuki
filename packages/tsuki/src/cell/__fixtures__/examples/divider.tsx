/**
 * @title Divider
 * @description Compares automatic, hidden, and forced row separators.
 */

import { Cell } from '@ftsukic/tsuki'

export default function Divider() {
  return (
    <Cell.Group border={false}>
      <Cell title="Default divider" />
      <Cell title="Divider hidden" divider={false} />
      <Cell title="Last row forces a divider" divider />
    </Cell.Group>
  )
}
