import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, useAnimatedStyle, useTransitionProgress } from '../..'
import { Pressable } from '../../../pressable'

/**
 * @title 共享进度
 * @description 使用 useTransitionProgress 同时驱动面板和辅助状态层。
 */
export default function SharedProgressExample() {
  const [visible, setVisible] = useState(true)
  const { progress, animatedStyle } = useTransitionProgress({
    entering: { duration: 240 },
    leaving: { duration: 240 },
    preset: { type: 'scale', fade: true },
    visible,
  })
  const progressStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  return (
    <View style={styles.page}>
      <Pressable onPress={() => setVisible((current) => !current)} style={styles.toggle}>
        <Text style={styles.toggleText}>{visible ? '隐藏' : '显示'} 共享过渡</Text>
      </Pressable>
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={[styles.panel, animatedStyle]}
      >
        <Text style={styles.panelText}>共享过渡面板</Text>
      </Animated.View>
      <Animated.View style={[styles.progress, progressStyle]} />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 16,
    minHeight: 180,
    padding: 20,
  },
  toggle: {
    alignSelf: 'flex-start',
    backgroundColor: '#101828',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  panel: {
    alignItems: 'center',
    backgroundColor: '#7f56d9',
    borderRadius: 12,
    height: 64,
    justifyContent: 'center',
  },
  panelText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  progress: {
    backgroundColor: '#12b76a',
    borderRadius: 4,
    height: 8,
    width: 80,
  },
})
