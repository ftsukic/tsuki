import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Loading action
 * @description Show a loading indicator and disable the action while work is in progress.
 */
export default function ActionSheetLoadingFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>上传文件</Button>
      <Text style={styles.caption}>加载中的 action 会保留在列表中并禁止重复触发。</Text>
      <ActionSheet
        visible={visible}
        actions={[{ name: '上传到云端', loading: true }, { name: '保存到本地' }]}
        onClose={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#667085',
    fontSize: 13,
  },
  container: {
    gap: 10,
  },
})
