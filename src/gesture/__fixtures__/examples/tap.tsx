import { useState } from 'react'
import { Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { Animated, Pressable } from '../../..'
import { GestureDetector, useTapGesture as useTapRecognition } from '../..'
import { styles } from '../style'

/**
 * @title Tap 识别与取消
 * @description 单击和双击仅在识别成功后更新 RN 状态，移出或识别失败后自动清除按下反馈。
 */
export default function TapExample() {
  const [numberOfTaps, setNumberOfTaps] = useState(1)
  const [count, setCount] = useState(0)
  // Worklets auto-converts callbacks for RNGH Hook names; this RN callback must stay on JS.
  const tap = useTapRecognition({ numberOfTaps, onPress: () => setCount((value) => value + 1) })
  tap.gesture.withTestId('fixture-tap')
  const { pressed } = tap
  const animatedStyle = useAnimatedStyle(() => ({ opacity: pressed.value ? 0.5 : 1 }))
  return (
    <View style={styles.page}>
      <Text style={styles.description}>
        触摸卡片后移出，观察反馈复位。双击模式下单次点击不会计数。普通按钮应使用
        Pressable；这里展示手势识别。
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => setNumberOfTaps((value) => (value === 1 ? 2 : 1))}
      >
        <Text style={styles.buttonText}>识别次数：{numberOfTaps}</Text>
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        成功识别：{count} 次
      </Text>
      <GestureDetector gesture={tap.gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.cardText}>Tap 手势区域</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
