import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Basic ActionSheet
 * @description Open a simple bottom action menu and close it with an action or cancel.
 */
export default function ActionSheetBasicFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>打开操作菜单</Button>
      <Text style={styles.caption}>点击 action 或取消按钮关闭菜单。</Text>
      <ActionSheet
        visible={visible}
        actions={[
          { name: '拍照', callback: () => setVisible(false) },
          { name: '从相册选择', callback: () => setVisible(false) },
        ]}
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
