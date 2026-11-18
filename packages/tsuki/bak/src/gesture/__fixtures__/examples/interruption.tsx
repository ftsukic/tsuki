import { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Animated, Pressable } from '../../..'
import { GestureDetector, usePanGesture as usePanInteraction } from '../..'
import { styles } from '../style'

/**
 * @title Pan 中断与取消
 * @description 拖动开始后自动禁用，观察取消结果；重新启用后可在回弹途中再次拖动。
 */
export default function InterruptionExample() {
  const [enabled, setEnabled] = useState(true)
  const [cancelDuringDrag, setCancelDuringDrag] = useState(false)
  const [status, setStatus] = useState('等待拖动')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const started = useCallback(() => {
    setStatus('拖动中')
    if (timer.current) clearTimeout(timer.current)
    if (cancelDuringDrag) timer.current = setTimeout(() => setEnabled(false), 600)
  }, [cancelDuringDrag])
  useEffect(() => () => clearTimeout(timer.current), [])
  // Worklets auto-converts callbacks for RNGH Hook names; this RN callback must stay on JS.
  const pan = usePanInteraction({
    direction: 'horizontal',
    maxDistance: 90,
    enabled,
    onStart: () => {
      'worklet'
      scheduleOnRN(started)
    },
    onFinalize: (event) => {
      clearTimeout(timer.current)
      setStatus(`${event.canceled ? '已取消' : '已释放'} · 位移 ${Math.round(event.translateX)}`)
    },
  })
  pan.gesture.withTestId('fixture-pan-interruption')
  const { translateX } = pan
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  return (
    <View style={styles.page}>
      <Text style={styles.description}>
        打开自动取消后，按住并拖动超过 600ms，卡片回零；普通释放后可立即再次拖动，打断回弹。
      </Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={() => setEnabled((value) => !value)}>
          <Text style={styles.buttonText}>{enabled ? '禁用拖动' : '重新启用'}</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          accessibilityState={{ selected: cancelDuringDrag }}
          onPress={() => setCancelDuringDrag((value) => !value)}
        >
          <Text style={styles.buttonText}>自动取消：{cancelDuringDrag ? '开' : '关'}</Text>
        </Pressable>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {status}
      </Text>
      <GestureDetector gesture={pan.gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.cardText}>拖动并打断</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
