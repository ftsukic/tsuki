/**
 * @title Disabled
 * @description Shows the value of a non-editable Input.
 */
import { Input } from '@ftsukic/tsuki'

export default function Disabled() {
  return <Input accessibilityLabel="Locked account" disabled value="Read only value" />
}
