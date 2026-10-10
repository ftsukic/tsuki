import { useState } from 'react'
import { Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { Animated, Pressable } from '../../..'
import { GestureDetector, useSwipeGesture } from '../..'
import { styles } from '../style'

/**
 * @title Swipe 吸附与稳定状态
 * @description 区分拖动范围 120 和打开目标 60，支持左右方向、禁用识别以及程序化打开关闭。
 */
export default function SwipeExample() {
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [enabled, setEnabled] = useState(true)
  const [open, setOpen] = useState(false)
  const swipe = useSwipeGesture({
    maxDistance: 120,
    snapPoint: 60,
    direction,
    enabled,
    onOpenChange: setOpen,
  })
  const { translateX, progress } = swipe
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  const progressStyle = useAnimatedStyle(() => ({ opacity: 0.2 + progress.value * 0.8 }))
  return (
    <View style={styles.page}>
      <Text style={styles.description}>
        拖动超过范围的一半或快速甩动即可打开。打开目标为 60，progress 按范围 120
        计算，因此完全打开时为 0.5。
      </Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={swipe.open}>
          <Text style={styles.buttonText}>打开</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={swipe.close}>
          <Text style={styles.buttonText}>关闭</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => setDirection((value) => (value === 'left' ? 'right' : 'left'))}
        >
          <Text style={styles.buttonText}>方向：{direction}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setEnabled((value) => !value)}>
          <Text style={styles.buttonText}>手势：{enabled ? '启用' : '禁用'}</Text>
        </Pressable>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        稳定状态：{open ? '已打开' : '已关闭'}；禁用手势后仍可使用打开/关闭按钮。
      </Text>
      <View style={styles.track}>
        <GestureDetector gesture={swipe.gesture}>
          <Animated.View style={[styles.card, animatedStyle]}>
            <Text style={styles.cardText}>Swipe</Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <Animated.View style={[styles.card, progressStyle]}>
        <Text style={styles.cardText}>拖动进度反馈</Text>
      </Animated.View>
    </View>
  )
}
