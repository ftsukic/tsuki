import { Input } from '../../..'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

/**
 * @title Input textarea
 * @description 多行输入支持 rows、清除和字数限制。
 */
export default function InputTextareaFixture() {
  const [value, setValue] = useState('')

  return (
    <View style={styles.container}>
      <Input
        multiline
        rows={4}
        bordered
        activeBordered={false}
        clearable
        clearTrigger="always"
        showWordLimit
        maxLength={80}
        value={value}
        placeholder="请输入多行内容"
        onChangeText={setValue}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
