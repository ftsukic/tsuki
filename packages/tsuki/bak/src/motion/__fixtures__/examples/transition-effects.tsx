import { useState } from 'react'
import { Text, View } from 'react-native'
import { MotionPressable, Transition } from '../..'
import type { TransitionName } from '../..'
import { demoStyles as styles } from '../style'

const names: TransitionName[] = [
  'fade',
  'scale',
  'scale-fade',
  'slide-up',
  'slide-down',
  'slide-left',
  'slide-right',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
]

/**
 * @title 基础过渡效果
 * @description 比较十一种 Transition，展示区域始终保留，退出后的内容隐藏但保持挂载。
 */
export default function TransitionEffectsExample() {
  const [visible, setVisible] = useState(true)
  return (
    <View style={styles.page}>
      <MotionPressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => setVisible((value) => !value)}
      >
        <Text style={styles.buttonText}>{visible ? '隐藏全部效果' : '显示全部效果'}</Text>
      </MotionPressable>
      <Text style={styles.description}>
        这里保持挂载以便反复对比。完成退出后，展示区域显示空态；重新显示时继续使用原节点。
      </Text>
      <View style={styles.grid}>
        {names.map((name) => (
          <EffectSample key={name} name={name} visible={visible} />
        ))}
      </View>
    </View>
  )
}
function EffectSample({ name, visible }: { name: TransitionName; visible: boolean }) {
  const [hidden, setHidden] = useState(false)
  return (
    <View style={styles.sample}>
      <Text style={styles.status}>{name}</Text>
      <View style={styles.sampleStage}>
        {hidden ? <Text style={styles.empty}>已隐藏 · 保持挂载</Text> : null}
        <Transition
          visible={visible}
          name={name}
          duration={600}
          style={[styles.sampleCard, { position: 'absolute' }]}
          onEnter={() => setHidden(false)}
          onExited={() => setHidden(true)}
        >
          <Text style={styles.cardText}>Motion</Text>
        </Transition>
      </View>
    </View>
  )
}
