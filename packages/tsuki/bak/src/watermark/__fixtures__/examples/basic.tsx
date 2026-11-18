import { useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Text, Watermark } from '../../..'

/**
 * @title Basic text watermark
 * @description Render repeated text over a local content area while keeping the content pressable.
 */
export default function WatermarkBasicExample() {
  const [pressed, setPressed] = useState(false)

  return (
    <Watermark content="Tsuki" style={styles.container}>
      <Pressable onPress={() => setPressed((value) => !value)} style={styles.content}>
        <Text style={styles.title}>内容仍然可以点击</Text>
        <Text type="secondary">{pressed ? '已点击内容' : '点击这里验证触摸穿透'}</Text>
      </Pressable>
    </Watermark>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minHeight: 180,
    overflow: 'hidden',
    padding: 24,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
})
