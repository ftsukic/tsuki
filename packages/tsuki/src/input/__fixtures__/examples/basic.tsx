/**
 * @title Native input behavior
 * @description Use the inherited TextInput props for value, keyboard, and accessibility behavior.
 */
import { useState } from 'react'
import { Input } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function InputBasicExample() {
  const [email, setEmail] = useState('')

  return (
    <View style={{ gap: 12 }}>
      <Input
        accessibilityLabel="Email address"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <Input accessibilityLabel="Disabled field" disabled value="Read only value" />
    </View>
  )
}
