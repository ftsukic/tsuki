import React from 'react'

import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from '../../..'

/**
 * @title TextInput states
 * @description Try controlled text input, clearable textarea and word-limit feedback.
 */
export default function TextInputBasicFixture() {
  const [value, setValue] = useState('')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Text</Text>
      <TextInput
        value={value}
        size="large"
        bordered
        clearable
        clearTrigger="always"
        prefix={<Text style={styles.prefix}>@</Text>}
        placeholder="Your username"
        onChangeText={setValue}
      />

      <Text style={styles.heading}>Textarea</Text>
      <TextInput
        value={value}
        type="textarea"
        rows={4}
        bordered
        clearable
        clearTrigger="always"
        showWordLimit
        maxLength={80}
        placeholder="Write a short introduction"
        onChangeText={setValue}
        formatter={(text) => text.replace(/\s+/g, ' ')}
      />

      <Text style={styles.value}>Current value: {value || '—'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  prefix: {
    color: '#1989fa',
    fontSize: 16,
  },
  value: {
    color: '#666666',
    fontSize: 13,
  },
})
