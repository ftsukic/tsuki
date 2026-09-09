import { StyleSheet, Text, View } from 'react-native'
import { Animated } from '../../..'
import { GestureDetector, usePanGesture } from '../../'

/**
 * @title Pan gestures
 * @description 横向和纵向 pan 都由 Gesture Handler 驱动，松手后通过 spring 回弹。
 */
export default function GestureExample() {
  const horizontal = usePanGesture({ direction: 'horizontal', maxDistance: 120 })
  const vertical = usePanGesture({ direction: 'vertical', maxDistance: 80 })

  return (
    <View style={styles.page}>
      <Text style={styles.description}>拖动两张卡片，松手后观察 spring 回弹。</Text>
      <View style={styles.track}>
        <GestureDetector gesture={horizontal.gesture}>
          <Animated.View
            style={[styles.horizontalCard, { transform: [{ translateX: horizontal.translateX }] }]}
          >
            <Text style={styles.cardText}>horizontal</Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={styles.verticalTrack}>
        <GestureDetector gesture={vertical.gesture}>
          <Animated.View
            style={[styles.verticalCard, { transform: [{ translateY: vertical.translateY }] }]}
          >
            <Text style={styles.cardText}>vertical</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 10,
    minHeight: 300,
    padding: 20,
  },
  description: {
    color: '#667085',
    lineHeight: 21,
  },
  track: {
    alignItems: 'flex-start',
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 88,
    overflow: 'hidden',
    padding: 8,
  },
  verticalTrack: {
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    justifyContent: 'flex-start',
    minHeight: 120,
    overflow: 'hidden',
    padding: 8,
  },
  horizontalCard: {
    alignItems: 'center',
    backgroundColor: '#1677ff',
    borderRadius: 12,
    height: 72,
    justifyContent: 'center',
    width: 160,
  },
  verticalCard: {
    alignItems: 'center',
    backgroundColor: '#12b76a',
    borderRadius: 12,
    height: 72,
    justifyContent: 'center',
    width: 160,
  },
  cardText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})
