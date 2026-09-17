import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Horizontal actions
 * @description Arrange Popover actions in a horizontal row.
 */
export default function PopoverHorizontalFixture() {
  return (
    <View style={styles.container}>
      <Popover
        actionsDirection="horizontal"
        actions={[{ text: '保存' }, { text: '分享' }, { text: '删除', color: '#ee0a24' }]}
      >
        <Button>横向菜单</Button>
      </Popover>
      <Text style={styles.caption}>每个 action 使用独立的横向分隔线。</Text>
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
