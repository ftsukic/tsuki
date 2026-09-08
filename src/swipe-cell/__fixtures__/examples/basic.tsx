import { SwipeCell } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Basic SwipeCell
 * @description Swipe left to reveal a right-side action and press the action to update the result.
 */
export default function SwipeCellBasicFixture() {
  const [result, setResult] = useState('向左滑动显示操作')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>基础用法</Text>
      <SwipeCell rightActions={[{ label: '删除', onPress: () => setResult('已删除') }]}>
        <View style={styles.content}>
          <Text style={styles.title}>订单 #1024</Text>
          <Text style={styles.subtitle}>{result}</Text>
        </View>
      </SwipeCell>
      <Text style={styles.caption}>操作区域按内容测量，滑动超过宽度的一半后展开。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#323233',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#969799',
    fontSize: 13,
  },
  caption: {
    color: '#969799',
    fontSize: 13,
  },
})
