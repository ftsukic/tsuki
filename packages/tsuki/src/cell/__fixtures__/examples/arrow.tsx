/**
 * @title Arrow
 */
import { Cell } from '../..'

export default function Arrow() {
  return (
    <Cell.Group>
      <Cell title="Back" showArrow arrowDirection="left" />
      <Cell title="Expand" showArrow arrowDirection="down" />
    </Cell.Group>
  )
}
