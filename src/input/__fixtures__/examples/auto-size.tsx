import { Input } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Input autoSize
 * @description multiline autoSize 会随内容增长，达到 maxRows 后转为内部滚动，删除内容时自动缩回。
 */
export default function InputAutoSizeFixture() {
  const [value, setValue] = useState('')
  const [composerValue, setComposerValue] = useState('')

  return (
    <View style={styles.container}>
      <Input
        multiline
        bordered
        autoSize={{ minRows: 1, maxRows: 5 }}
        placeholder="输入消息"
        value={value}
        onChangeText={setValue}
      />
      <Text style={styles.value}>当前内容：{value || '（空）'}</Text>

      <View style={styles.composerDemo}>
        <Input
          multiline
          bordered
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder="发送消息"
          value={composerValue}
          onChangeText={setComposerValue}
        />
      </View>
      <Text style={styles.value}>IM 输入框：{composerValue || '（空）'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  composerDemo: {
    height: 180,
    justifyContent: 'flex-end',
  },
  container: {
    gap: 12,
  },
  value: {
    color: '#666',
  },
})
