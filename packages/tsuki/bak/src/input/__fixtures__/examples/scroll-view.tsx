import { Input } from '../../..'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * @title Input in ScrollView
 * @description 聚焦后点击清除按钮时，ScrollView 使用 keyboardShouldPersistTaps 保留子控件触摸。
 */
export default function InputScrollViewFixture() {
  const [value, setValue] = useState('可清除的输入内容')

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <Text style={styles.title}>ScrollView 内的 single-line Input</Text>
      <Input bordered clearable placeholder="请输入内容" value={value} onChangeText={setValue} />
      <Text>当前值：{value || '（空）'}</Text>
      <View style={styles.spacer} />
      <Text>点击清除按钮后，输入框仍可继续保持焦点。</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
  },
  spacer: {
    height: 420,
  },
  title: {
    fontWeight: '600',
  },
})
