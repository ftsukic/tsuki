import { Button, SwipeCell, SwipeCellAction } from '../../..'
import { useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { SwipeCellRef } from '../../..'

/**
 * @title Imperative ref
 * @description Control the open side and closed state with the SwipeCell ref methods.
 */
export default function SwipeCellRefFixture() {
  const ref = useRef<SwipeCellRef>(null)

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Ref 控制</Text>
      <View style={styles.controls}>
        <Button size="small" type="primary" onPress={() => ref.current?.open('right')}>
          打开右侧
        </Button>
        <Button size="small" onPress={() => ref.current?.close()}>
          关闭
        </Button>
      </View>
      <SwipeCell
        ref={ref}
        rightAction={<SwipeCellAction onPress={() => ref.current?.close()}>删除</SwipeCellAction>}
      >
        <View style={styles.content}>
          <Text style={styles.title}>可通过 ref 控制的单元格</Text>
          <Text style={styles.subtitle}>open(right) / close()</Text>
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
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#323233',
    fontSize: 16,
  },
  subtitle: {
    color: '#969799',
    fontSize: 13,
  },
})
