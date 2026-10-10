import { useState } from 'react'
import { Text, View } from 'react-native'
import { MotionPressable, Transition } from '../..'
import { demoStyles as styles } from '../style'

/**
 * @title 退出与卸载
 * @description 单独观察 Transition 的进入、退出及 children 卸载，保留明确的空态。
 */
export default function TransitionLifecycleExample() {
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState('进入中')
  const [mounted, setMounted] = useState(true)
  return (
    <View style={styles.page}>
      <MotionPressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => setVisible((value) => !value)}
      >
        <Text style={styles.buttonText}>{visible ? '退出并卸载卡片' : '重新显示卡片'}</Text>
      </MotionPressable>
      <Text style={styles.description}>
        退出过程中卡片仍挂载；动画完成后移除卡片。展示区域保留边框和空态，便于观察。
      </Text>
      <View style={styles.stage} testID="lifecycle-stage">
        {!mounted ? <Text style={styles.empty}>卡片已卸载，展示区域保留</Text> : null}
        <Transition
          visible={visible}
          name="fade-up"
          duration={600}
          unmountOnExit
          style={styles.card}
          onEnter={() => {
            setMounted(true)
            setPhase('进入中')
          }}
          onEntered={() => setPhase('已进入')}
          onExit={() => setPhase('退出中，卡片仍挂载')}
          onExited={() => {
            setMounted(false)
            setPhase('已退出并卸载')
          }}
        >
          <Text style={styles.cardText}>Transition 卡片</Text>
        </Transition>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        卡片状态：{phase}
      </Text>
    </View>
  )
}
