import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from '../../..'

/**
 * @title TextInput states
 * @description 展示 TextInput 的受控、非受控和原生输入能力。
 */
export default function TextInputBasicFixture() {
  const [value, setValue] = useState('')
  const [eventText, setEventText] = useState('')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Controlled</Text>
      <TextInput
        value={value}
        placeholder="请输入"
        onChangeText={setValue}
        onChange={(event) => setEventText(event.nativeEvent.text)}
      />

      <Text style={styles.heading}>Uncontrolled and native props</Text>
      <TextInput defaultValue="default" keyboardType="numeric" placeholder="数字键盘" />

      <TextInput secureTextEntry placeholder="密码" />
      <TextInput multiline placeholder="多行输入" />
      <TextInput editable={false} defaultValue="不可编辑" />

      <Text style={styles.value}>onChangeText: {value || '—'}</Text>
      <Text style={styles.value}>onChange event text: {eventText || '—'}</Text>
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
  value: {
    color: '#666666',
    fontSize: 13,
  },
})
