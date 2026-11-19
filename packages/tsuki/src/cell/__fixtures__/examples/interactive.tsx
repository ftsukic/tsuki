/**
 * @title Interactive
 * @description Updates the visible value when pressed.
 */
import { Cell } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function Interactive() {
  const [count, setCount] = useState(0)

  return <Cell title="Tap to count" value={count} onPress={() => setCount((value) => value + 1)} />
}
