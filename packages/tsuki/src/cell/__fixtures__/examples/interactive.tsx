/**
 * @title Interactive
 */
import { useState } from 'react'
import { Cell } from '../..'

export default function Interactive() {
  const [count, setCount] = useState(0)

  return <Cell title="Tap to count" value={count} onPress={() => setCount(count + 1)} />
}
