import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, useAnimatedStyle, useTransitionProgress } from '../../..'
import { Pressable } from '../../../pressable'

/**
 * @title Shared transition progress
 * @description 使用 useTransitionProgress 同时驱动面板和辅助状态层。
 */
export default function ProgressExample() {
  const [visible, setVisible] = useState(true)
  const { progress, animatedStyle } = useTransitionProgress({
    entering: { duration: 240 },
    leaving: { duration: 240 },
    preset: { type: 'scale', scale: 0.82 },
    visible,
  })
  const progressStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  return (
    <View style={styles.page}>
      <Pressable onPress={() => setVisible((current) => !current)} style={styles.toggle}>
        <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'} shared transition</Text>
      </Pressable>
      <Animated.View style={[styles.panel, animatedStyle]}>
        <Text style={styles.panelText}>panel</Text>
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
