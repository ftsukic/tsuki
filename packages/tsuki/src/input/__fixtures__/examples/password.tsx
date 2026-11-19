/**
 * @title Password
 * @description Toggles inherited secure text entry without clearing the input.
 */
import { useState } from 'react'
import { Button, Input } from '@ftsukic/tsuki'

export default function Password() {
  const [revealed, setRevealed] = useState(false)
  return (
    <Input
      accessibilityLabel="Password"
      autoCapitalize="none"
      placeholder="Enter a password"
      secureTextEntry={!revealed}
      suffix={
        <Button variant="ghost" size="small" onPress={() => setRevealed(!revealed)}>
          {revealed ? 'Hide' : 'Show'}
        </Button>
      }
    />
  )
}
