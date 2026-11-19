/**
 * @title Basic
 * @description Updates the label when the action is pressed.
 */
import { useState } from 'react'
import { Button } from '@ftsukic/tsuki'

export default function Basic() {
  const [count, setCount] = useState(0)
  return <Button onPress={() => setCount((value) => value + 1)}>{`Pressed ${count} times`}</Button>
}
