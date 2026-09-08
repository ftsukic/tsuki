import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title ActionSheet title
 * @description Show a non-interactive title above the actions.
 */
export default function ActionSheetTitleFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>选择分享方式</Button>
      <ActionSheet
        visible={visible}
        title="请选择分享方式"
        actions={[{ name: '发送给朋友' }, { name: '分享到朋友圈' }]}
        onClose={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
})
