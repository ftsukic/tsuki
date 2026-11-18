import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, MotionPressable, motionPresets, useAnimatedTransition } from '../..'
import { ConfigProvider } from '../../../theme'

/**
 * @title 动效开关
 * @description 比较主题开关与局部开关，关闭动画后仍即时到达目标状态并保留按下反馈。
 */
export default function MotionConfigExample() {
  const [visible, setVisible] = useState(true)
  const [themeMotion, setThemeMotion] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [slow, setSlow] = useState(false)

  return (
    <ConfigProvider
      theme={{
        seed: { motion: themeMotion },
        motion: { reducedMotion: reduced ? 'always' : 'system', durationScale: slow ? 3 : 1 },
      }}
    >
      <View style={styles.page}>
        <View style={styles.controls}>
          <MotionPressable
            accessibilityRole="button"
            accessibilityState={{ selected: themeMotion }}
            onPress={() => setThemeMotion((current) => !current)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>主题动画：{themeMotion ? '开启' : '关闭'}</Text>
          </MotionPressable>
          <MotionPressable
            accessibilityRole="button"
            onPress={() => setVisible((current) => !current)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>{visible ? '隐藏卡片' : '显示卡片'}</Text>
          </MotionPressable>
          <MotionPressable
            accessibilityRole="button"
            accessibilityState={{ selected: reduced }}
            onPress={() => setReduced((value) => !value)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>减少动态：{reduced ? '开启' : '系统'}</Text>
          </MotionPressable>
          <MotionPressable
            accessibilityRole="button"
            accessibilityState={{ selected: slow }}
            onPress={() => setSlow((value) => !value)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>时长倍率：{slow ? '3 倍' : '1 倍'}</Text>
          </MotionPressable>
        </View>
        <Text style={styles.description}>
          关闭主题动画时，所有卡片即时到达目标。按住按钮仍有触摸反馈；动画进行时也可关闭主题动画。
        </Text>
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          当前目标：{visible ? '显示' : '隐藏'}
        </Text>
        <View style={styles.samples}>
          <PolicySample title="遵循主题" visible={visible} />
          <PolicySample motion={false} title="局部关闭" visible={visible} />
          <PolicySample motion title="局部开启" visible={visible} />
        </View>
        <Text style={styles.note}>
          局部开启也遵守全局关闭与减少动态效果；倍率同时改变 timing 时长和 spring 收敛速度。
        </Text>
      </View>
    </ConfigProvider>
  )
}

function PolicySample({
  motion,
  title,
  visible,
}: {
  motion?: boolean
  title: string
  visible: boolean
}) {
  const animatedStyle = useAnimatedTransition({ motion, preset: motionPresets.dialog, visible })

  return (
    <View style={styles.sample}>
      <Text style={styles.sampleTitle}>{title}</Text>
      <View style={styles.stage}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.cardText}>显示</Text>
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
  secondaryButton: {
    backgroundColor: '#eaf2ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: { opacity: 0.65 },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  secondaryText: { color: '#175cd3', fontSize: 14, fontWeight: '600' },
  description: { color: '#475467', fontSize: 13, lineHeight: 20 },
  status: { color: '#175cd3', fontSize: 14, fontWeight: '600' },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sample: { flexBasis: 100, flexGrow: 1, gap: 8, minWidth: 100 },
  sampleTitle: { color: '#344054', fontSize: 13, fontWeight: '600' },
  stage: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#d0d5dd',
    borderRadius: 12,
    borderWidth: 1,
    height: 110,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#12b76a',
    borderRadius: 10,
    height: 60,
    justifyContent: 'center',
    width: 80,
  },
  cardText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  note: { color: '#667085', fontSize: 12, lineHeight: 18 },
})
