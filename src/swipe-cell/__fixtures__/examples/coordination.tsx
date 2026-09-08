import { SwipeCell } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Provider coordination
 * @description Open one cell at a time without wrapping the rows in SwipeCellGroup.
 */
export default function SwipeCellCoordinationFixture() {
  const rows = ['第一项', '第二项', '第三项']

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Provider 级单开</Text>
      {rows.map((title) => (
        <SwipeCell key={title} rightActions={[{ label: '删除' }]}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>打开这一项会自动关闭其它项</Text>
          </View>
        </SwipeCell>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 1 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600', marginBottom: 11 },
  content: { backgroundColor: '#ffffff', gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#323233', fontSize: 16 },
  subtitle: { color: '#969799', fontSize: 13 },
})
