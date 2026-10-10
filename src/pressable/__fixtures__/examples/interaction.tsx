import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Pressable } from '../../..'
import type { PressStyle } from '../../..'
import { ConfigProvider } from '../../../theme'

const feedbacks: PressStyle[] = ['opacity', 'scale', 'background', 'overlay', 'none']

/**
 * @title 按压状态与事件边界
 * @description 比较禁用、长按、点击节流、反馈切换、局部关闭和 Motion 策略，观察同一个 pressed 状态。
 */
export default function InteractionExample() {
  const [disabled, setDisabled] = useState(false)
  const [feedback, setFeedback] = useState<PressStyle>('opacity')
  const [count, setCount] = useState(0)
  const [longPresses, setLongPresses] = useState(0)
  const [reduced, setReduced] = useState(false)
  const [localMotion, setLocalMotion] = useState(true)
  const [slow, setSlow] = useState(false)
  const [cycleDuringPress, setCycleDuringPress] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const cycle = () =>
    setFeedback((current) => feedbacks[(feedbacks.indexOf(current) + 1) % feedbacks.length])

  return (
    <ConfigProvider
      theme={{
        motion: { reducedMotion: reduced ? 'always' : 'system', durationScale: slow ? 3 : 1 },
      }}
    >
      <View style={styles.page}>
        <Text style={styles.description}>
          按住主按钮观察文字、边框和反馈同时变化。长按 500ms；快速重复点击只在 800ms
          窗口外计数。移出或开始滚动可取消点击。
        </Text>
        <View style={styles.controls}>
          <Control
            label={`禁用：${disabled ? '是' : '否'}`}
            onPress={() => setDisabled((value) => !value)}
          />
          <Control label={`反馈：${feedback}`} onPress={cycle} />
          <Control
            label={`按住时切换：${cycleDuringPress ? '开' : '关'}`}
            onPress={() => setCycleDuringPress((value) => !value)}
          />
          <Control
            label={`局部动画：${localMotion ? '开' : '关'}`}
            onPress={() => setLocalMotion((value) => !value)}
          />
          <Control
            label={`减少动态：${reduced ? '开' : '系统'}`}
            onPress={() => setReduced((value) => !value)}
          />
          <Control label={`倍率：${slow ? '3' : '1'}`} onPress={() => setSlow((value) => !value)} />
        </View>
        <Pressable
          testID="press-interaction-sample"
          disabled={disabled}
          motion={localMotion}
          pressStyle={feedback}
          hitSlop={8}
          pressRetentionOffset={20}
          delayLongPress={500}
          onPressDebounceWait={800}
          onPress={() => setCount((value) => value + 1)}
          onLongPress={() => setLongPresses((value) => value + 1)}
          onPressIn={() => {
            clearTimeout(timer.current)
            if (cycleDuringPress) timer.current = setTimeout(cycle, 700)
          }}
          onPressOut={() => clearTimeout(timer.current)}
          style={({ pressed }) => [styles.sample, { borderColor: pressed ? '#1677ff' : '#d0d5dd' }]}
        >
          {({ pressed }) => (
            <Text style={styles.sampleText}>
              {pressed ? '按压中' : disabled ? '已禁用' : '按住体验'}
            </Text>
          )}
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.description}>
          点击 {count} 次 · 长按 {longPresses} 次
        </Text>
        <Text style={styles.description}>
          关闭动画仍保留即时反馈。pressedStyle 只作用于 background 根节点或 overlay 覆盖层。
        </Text>
      </View>
    </ConfigProvider>
  )
}

function Control({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} pressStyle="background" style={styles.control}>
      <Text style={styles.controlText}>{label}</Text>
    </Pressable>
  )
}
const styles = StyleSheet.create({
  page: { padding: 20, gap: 16 },
  description: { color: '#475467', lineHeight: 21 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  control: { backgroundColor: '#eaf2ff', padding: 12, borderRadius: 8, minHeight: 44 },
  controlText: { color: '#175cd3' },
  sample: {
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
  },
  sampleText: { color: '#101828', fontWeight: '600' },
})
