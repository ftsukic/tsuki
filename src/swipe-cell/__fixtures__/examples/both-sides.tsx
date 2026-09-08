import { SwipeCell } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Left and right actions
 * @description Provide independent left and right actions with their own pressed behavior.
 */
export default function SwipeCellBothSidesFixture() {
  const [result, setResult] = useState('左右两侧都可以滑动')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>左右双侧操作</Text>
      <SwipeCell
        leftActions={[
          { label: '置顶', backgroundColor: '#1989FA', onPress: () => setResult('已置顶') },
        ]}
        rightActions={[
          { label: '删除', backgroundColor: '#EE0A24', onPress: () => setResult('已删除') },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>项目通知</Text>
          <Text style={styles.subtitle}>{result}</Text>
        </View>
      </SwipeCell>
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
})
