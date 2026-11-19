/**
 * @title Arrow
 * @description Shows left and down navigation indicators.
 */

import { Cell } from '@ftsukic/tsuki'

export default function Arrow() {
  return (
    <Cell.Group>
      <Cell title="Back" showArrow arrowDirection="left" />
      <Cell title="Expand" showArrow arrowDirection="down" />
    </Cell.Group>
  )
}
