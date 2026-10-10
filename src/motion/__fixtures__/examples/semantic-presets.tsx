import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, MotionPressable, motionPresets, useAnimatedTransition } from '../..'
import type { MotionPreset } from '../..'

/**
 * @title 语义预设
 * @description 比较 dialog、popup、drawer、popover、toast 与 springScale，支持慢速观察。
 */
export default function SemanticPresetsExample() {
  const [visible, setVisible] = useState(true)
  const [slow, setSlow] = useState(false)

  return (
    <View style={styles.page}>
      <View style={styles.controls}>
        <MotionPressable
          accessibilityRole="button"
          onPress={() => setVisible((current) => !current)}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{visible ? '隐藏全部' : '显示全部'}</Text>
        </MotionPressable>
        <MotionPressable
          accessibilityRole="button"
          accessibilityState={{ selected: slow }}
          onPress={() => setSlow((current) => !current)}
          style={({ pressed }) => [styles.speedButton, pressed && styles.pressed]}
        >
          <Text style={styles.speedText}>{slow ? '慢速 600ms' : '正常 200ms'}</Text>
        </MotionPressable>
      </View>
      <Text style={styles.description}>
        先切换速度，再显示或隐藏。弹簧保持自然弹性，不受慢速时长控制。
      </Text>
      <View style={styles.grid}>
        <EffectSample
          color="#1677ff"
          description="淡入淡出"
          duration={slow ? 600 : 200}
          preset={motionPresets.fade}
          title="fade"
          visible={visible}
        />
        <EffectSample
          color="#344054"
          description="缩放 + 淡入"
          duration={slow ? 600 : 200}
          preset={motionPresets.dialog}
          title="dialog"
          visible={visible}
        />
        <EffectSample
          color="#7f56d9"
          description="底部滑入"
          duration={slow ? 600 : 200}
          preset={motionPresets.popupBottom}
          title="popupBottom"
          visible={visible}
        />
        <EffectSample
          color="#6172f3"
          description="顶部滑入"
          duration={slow ? 600 : 200}
          preset={motionPresets.popupTop}
          title="popupTop"
          visible={visible}
        />
        <EffectSample
          color="#0891b2"
          description="左侧滑入"
          duration={slow ? 600 : 200}
          preset={motionPresets.drawerLeft}
          title="drawerLeft"
          visible={visible}
        />
        <EffectSample
          color="#9333ea"
          description="右侧滑入"
          duration={slow ? 600 : 200}
          preset={motionPresets.drawerRight}
          title="drawerRight"
          visible={visible}
        />
        <EffectSample
          color="#12b76a"
          description="轻微缩放 + 淡入"
          duration={slow ? 600 : 200}
          preset={motionPresets.popover}
          title="popover"
          visible={visible}
        />
        <EffectSample
          color="#d97706"
          description="轻微缩放 + 淡入"
          duration={slow ? 600 : 200}
          preset={motionPresets.toast}
          title="toast"
          visible={visible}
        />
        <EffectSample
          color="#db2777"
          description="弹性缩放 + 淡入"
          duration={slow ? 600 : 200}
          preset={motionPresets.springScale}
          title="springScale"
          visible={visible}
        />
      </View>
      <Text style={styles.note}>
        dialog、popover 和 toast 复用相同基础效果，使用各自的语义缩放值。
      </Text>
    </View>
  )
}

function EffectSample({
  color,
  description,
  duration,
  preset,
  title,
  visible,
}: {
  color: string
  description: string
  duration: number
  preset: MotionPreset
  title: string
  visible: boolean
}) {
  const animatedStyle = useAnimatedTransition({
    distance:
      preset.type === 'slide-left' || preset.type === 'slide-right'
        ? 160
        : preset.type.startsWith('slide-')
          ? 120
          : undefined,
    entering: { duration },
    leaving: { duration },
    preset,
    visible,
  })

  return (
    <View style={styles.sample}>
      <Text style={styles.sampleTitle}>{title}</Text>
      <Text style={styles.sampleDescription}>{description}</Text>
      <View style={styles.stage}>
        <View pointerEvents="none" style={styles.outline} />
        <Animated.View style={[styles.card, { backgroundColor: color }, animatedStyle]}>
          <Text style={styles.cardText}>Motion</Text>
        </Animated.View>
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
  speedButton: {
    backgroundColor: '#eaf2ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  speedText: { color: '#175cd3', fontSize: 14, fontWeight: '600' },
  description: { color: '#475467', fontSize: 13, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sample: { flexBasis: 140, flexGrow: 1, gap: 4, minWidth: 140 },
  sampleTitle: { color: '#101828', fontSize: 14, fontWeight: '600' },
  sampleDescription: { color: '#667085', fontSize: 12 },
  stage: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#d0d5dd',
    borderRadius: 12,
    borderWidth: 1,
    height: 120,
    justifyContent: 'center',
    marginTop: 6,
    overflow: 'hidden',
  },
  outline: {
    borderColor: '#98a2b3',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 64,
    position: 'absolute',
    width: 108,
  },
  card: {
    alignItems: 'center',
    borderRadius: 10,
    height: 64,
    justifyContent: 'center',
    width: 108,
  },
  cardText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  note: { color: '#667085', fontSize: 12, lineHeight: 18 },
})
