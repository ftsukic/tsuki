import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Disabled action
 * @description Keep an unavailable action in the menu without allowing it to be pressed.
 */
export default function ActionSheetDisabledFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>打开状态菜单</Button>
      <Text style={styles.caption}>灰色 action 不会响应点击。</Text>
      <ActionSheet
        visible={visible}
        actions={[
          { name: '编辑' },
          { name: '同步中', disabled: true },
          { name: '删除', color: '#ee0a24' },
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
