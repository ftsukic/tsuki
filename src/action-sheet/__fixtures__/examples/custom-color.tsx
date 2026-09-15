import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Custom color action
 * @description Render a destructive action with a custom color.
 */
export default function ActionSheetCustomColorFixture() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <View style={styles.container}>
      <Button type="danger" onPress={() => setVisible(true)}>
        管理文件
      </Button>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <ActionSheet
        visible={visible}
        title="文件操作"
        actions={[
          { name: '重命名', callback: () => setMessage('已选择重命名') },
          { name: '删除文件', color: '#ee0a24', callback: () => setMessage('已选择删除') },
        ]}
        onClose={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  message: {
    color: '#667085',
    fontSize: 13,
  },
})
