/**
 * @title Group Inset
 */
import { Cell } from '../..'

export default function GroupInset() {
  return (
    <Cell.Group inset title="Profile">
      <Cell title="Name" value="Taylor" />
      <Cell title="Email" showArrow />
    </Cell.Group>
  )
}
