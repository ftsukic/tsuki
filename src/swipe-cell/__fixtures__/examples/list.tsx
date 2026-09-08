import { SwipeCell, useSwipeCellController } from '../../..'
import { FlatList, StyleSheet, Text, View } from 'react-native'

/**
 * @title List usage
 * @description Close the active row from onScrollBeginDrag without guessing the parent list type.
 */
export default function SwipeCellListFixture() {
  const swipeCell = useSwipeCellController()
  const data = ['收件箱', '项目讨论', '设计评审', '发布检查', '归档']

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>列表用法</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        onScrollBeginDrag={swipeCell.closeCurrent}
        renderItem={({ item }) => (
          <SwipeCell rightActions={[{ label: '更多' }]}>
            <View style={styles.content}>
              <Text style={styles.title}>{item}</Text>
              <Text style={styles.subtitle}>开始纵向滚动时关闭当前项</Text>
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
  list: { maxHeight: 260 },
  content: { backgroundColor: '#ffffff', gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#323233', fontSize: 16 },
  subtitle: { color: '#969799', fontSize: 13 },
})
