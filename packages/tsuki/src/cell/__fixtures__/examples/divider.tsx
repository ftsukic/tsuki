/**
 * @title Divider
 */
import { Cell } from '../..'

export default function Divider() {
  return (
    <Cell.Group border={false}>
      <Cell title="Default divider" />
      <Cell title="Divider hidden" divider={false} />
      <Cell title="Last row forces a divider" divider />
    </Cell.Group>
  )
}
