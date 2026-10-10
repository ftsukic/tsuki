import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Animated, motionPresets, useAnimatedTransition } from '../..'

/**
 * @title 快速反转
 * @description 在进出场途中改变目标，观察当前位置衔接和最终完成事件。
 */
export default function InterruptionExample() {
  const [visible, setVisible] = useState(false)
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState('等待开始')
  const [events, setEvents] = useState<string[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const recording = useRef(false)
  const automatic = useRef(false)
  const sequenceStep = useRef(0)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const animatedStyle = useAnimatedTransition({
    entering: { duration: 800 },
    leaving: { duration: 800 },
    onTransitionEnd: (nextVisible) => {
      if (!recording.current) return
      setEvents((current) => [...current, `完成：${nextVisible ? '显示' : '隐藏'}`])
      if (automatic.current && sequenceStep.current === 3 && nextVisible) {
        automatic.current = false
        setRunning(false)
        setStep('序列结束，最终显示')
      }
    },
    preset: motionPresets.dialog,
    visible,
  })

  const runSequence = () => {
    clearTimers()
    recording.current = false
    automatic.current = true
    sequenceStep.current = 0
    setEvents([])
    setRunning(true)
    setVisible(false)
    setStep('准备')
    timers.current = [
      setTimeout(() => {
        sequenceStep.current = 1
        recording.current = true
        setVisible(true)
        setStep('1 / 3：显示')
      }, 80),
      setTimeout(() => {
        setVisible(false)
        sequenceStep.current = 2
        setStep('2 / 3：途中隐藏')
      }, 280),
      setTimeout(() => {
        sequenceStep.current = 3
        setVisible(true)
        setStep('3 / 3：再次显示')
      }, 480),
    ]
  }

  const toggleManually = () => {
    clearTimers()
    automatic.current = false
    recording.current = true
    setRunning(false)
    setStep('手动切换，可连续点击')
    setVisible((current) => !current)
  }

  return (
    <View style={styles.page}>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={running}
          onPress={runSequence}
          style={({ pressed }) => [styles.button, (pressed || running) && styles.pressed]}
        >
          <Text style={styles.buttonText}>{running ? '演示进行中' : '自动反转三次'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={toggleManually}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>手动{visible ? '隐藏' : '显示'}</Text>
        </Pressable>
      </View>
      <Text style={styles.description}>
        自动演示：显示 → 途中隐藏 →
        再次显示。动画开启时卡片应平滑反转，日志最终只有一次“完成：显示”。关闭动画或减少动态效果时，每一步都会即时完成。
      </Text>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {step}
      </Text>
      <View style={styles.stage}>
        <View pointerEvents="none" style={styles.outline} />
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.cardText}>连续切换，继续运动</Text>
        </Animated.View>
      </View>
      <View style={styles.log}>
        <Text style={styles.logTitle}>完成事件 · {events.length} 次</Text>
        <Text accessibilityLiveRegion="polite" style={styles.logText}>
          {events.length ? events.slice(-5).join('\n') : '尚无完成事件'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { gap: 14, padding: 16 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: {
    backgroundColor: '#101828',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: { opacity: 0.65 },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#eaf2ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: { color: '#175cd3', fontSize: 14, fontWeight: '600' },
  description: { color: '#475467', fontSize: 13, lineHeight: 20 },
  status: { color: '#175cd3', fontSize: 14, fontWeight: '600' },
  stage: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#d0d5dd',
    borderRadius: 12,
    borderWidth: 1,
    height: 150,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  outline: {
    borderColor: '#98a2b3',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 80,
    position: 'absolute',
    width: 220,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#7f56d9',
    borderRadius: 12,
    height: 80,
    justifyContent: 'center',
    width: 220,
  },
  cardText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  log: { backgroundColor: '#f2f4f7', borderRadius: 8, gap: 6, padding: 12 },
  logTitle: { color: '#344054', fontSize: 13, fontWeight: '600' },
  logText: { color: '#475467', fontSize: 13, lineHeight: 20 },
})
