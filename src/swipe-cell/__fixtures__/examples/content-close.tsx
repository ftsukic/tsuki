import { SwipeCell } from '../../..'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

/**
 * @title Content press closes
 * @description Press the content after expanding the row; the content press handler still runs.
 */
export default function SwipeCellContentCloseFixture() {
  const [result, setResult] = useState('先向左滑动，再点击主体')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>点击主体关闭</Text>
      <SwipeCell rightActions={[{ label: '删除' }]}>
        <Pressable onPress={() => setResult('主体 onPress 已执行')} style={styles.content}>
          <Text style={styles.title}>可点击的主体</Text>
          <Text style={styles.subtitle}>{result}</Text>
        </Pressable>
      </SwipeCell>
      <Text style={styles.caption}>关闭不会阻止主体原有的 Pressable 事件。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600' },
  content: { backgroundColor: '#ffffff', gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#323233', fontSize: 16, fontWeight: '600' },
  subtitle: { color: '#969799', fontSize: 13 },
  caption: { color: '#969799', fontSize: 13 },
})
