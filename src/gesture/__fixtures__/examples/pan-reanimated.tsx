import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from '../../'
import { Animated, useAnimatedStyle, useSharedValue, withSpring } from '../../../animation'

/**
 * @title Pan + Reanimated
 * @description 使用 Gesture.Pan 驱动 UI thread 上的 SharedValue，并在结束时弹簧回弹。
 */
export default function PanReanimatedExample() {
  const translateX = useSharedValue(0)
  const gestureStartX = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }))
  const pan = Gesture.Pan()
    .onStart(() => {
      gestureStartX.set(translateX.get())
    })
    .onUpdate((event) => {
      translateX.set(gestureStartX.get() + event.translationX)
    })
    .onEnd((event) => {
      translateX.set(
        withSpring(0, {
          dampingRatio: 0.8,
          duration: 400,
          velocity: event.velocityX,
        }),
      )
    })

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Gesture Handler + Reanimated</Text>
      <Text style={styles.description}>拖动蓝色卡片，松手后观察 spring 回弹。</Text>
      <View style={styles.track}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, animatedStyle]}>
            <Text style={styles.cardText}>Pan</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 10,
    minHeight: 260,
    padding: 20,
  },
  title: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    color: '#667085',
    lineHeight: 21,
  },
  track: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 120,
    overflow: 'hidden',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#1677ff',
    borderRadius: 14,
    height: 88,
    justifyContent: 'center',
    width: 180,
  },
  cardText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
})
