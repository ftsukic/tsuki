/**
 * @title Native input behavior
 * @description Use the inherited TextInput props for value, keyboard, and accessibility behavior.
 */
import { Input } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function InputBasicExample() {
  const [email, setEmail] = useState('')

  return (
    <Input
      accessibilityLabel="Email address"
      autoCapitalize="none"
      keyboardType="email-address"
      placeholder="name@example.com"
      value={email}
      onChangeText={setEmail}
    />
  )
}
