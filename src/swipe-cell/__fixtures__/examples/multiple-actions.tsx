import { SwipeCell } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Multiple actions
 * @description Render independent action items on one side and measure their combined slot width.
 */
export default function SwipeCellMultipleActionsFixture() {
  const [result, setResult] = useState('向左滑动显示两个独立操作')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>多个 action</Text>
      <SwipeCell
        rightActions={[
          { label: '更多', backgroundColor: '#1989FA', onPress: () => setResult('已点击更多') },
          { label: '删除', backgroundColor: '#EE0A24', onPress: () => setResult('已删除') },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>报告 #1024</Text>
          <Text style={styles.subtitle}>{result}</Text>
        </View>
      </SwipeCell>
      <Text style={styles.caption}>展开距离等于“更多”和“删除”的总宽度，点击后默认关闭。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600' },
  content: { gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#323233', fontSize: 16, fontWeight: '600' },
  subtitle: { color: '#969799', fontSize: 13 },
  caption: { color: '#969799', fontSize: 13 },
})
