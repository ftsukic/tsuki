import { FlashList } from '@shopify/flash-list'
import { SwipeCell, useSwipeCellController } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

const messages = Array.from({ length: 1000 }, (_, index) => ({
  id: `message-${index + 1}`,
  name: `消息 ${index + 1}`,
}))

/**
 * @title FlashList with 1000 messages
 * @description 使用稳定 id 和 Provider manager 支持 FlashList 回收大量 SwipeCell。
 */
export default function SwipeCellFlashListFixture() {
  const swipeCell = useSwipeCellController()

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>FlashList 1000 条</Text>
      <FlashList
        data={messages}
        keyExtractor={(item) => item.id}
        onScrollBeginDrag={swipeCell.closeCurrent}
        renderItem={({ item }) => (
          <SwipeCell id={item.id} actions={[{ text: '删除', color: 'danger' }]}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.preview}>向左滑动查看操作</Text>
            </View>
          </SwipeCell>
        )}
        style={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600' },
  list: { height: 320 },
  row: { backgroundColor: '#ffffff', gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  name: { color: '#323233', fontSize: 16, fontWeight: '600' },
  preview: { color: '#969799', fontSize: 13 },
})
