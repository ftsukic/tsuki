import { Input } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Input basic
 * @description 展示受控输入、清除操作和 disabled/readOnly 状态。
 */
export default function InputBasicFixture() {
  const [value, setValue] = useState('')

  return (
    <View style={styles.container}>
      <Input
        value={value}
        bordered
        clearable
        clearTrigger="always"
        placeholder="请输入内容"
        onChangeText={setValue}
      />
      <Text>当前值：{value || '—'}</Text>
      <Input disabled defaultValue="禁用输入" bordered />
      <Input readOnly defaultValue="只读输入" bordered />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
