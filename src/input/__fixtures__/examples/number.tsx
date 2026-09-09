import { Input } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Input number
 * @description 数字键盘输入仍然保留字符串值，包括前导零。
 */
export default function InputNumberFixture() {
  const [value, setValue] = useState('001')

  return (
    <View style={styles.container}>
      <Input type="number" value={value} bordered onChangeText={setValue} />
      <Text>字符串值：{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
