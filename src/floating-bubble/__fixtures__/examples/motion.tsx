import { useState } from 'react'
import { Button, ConfigProvider, FloatingBubble, Text } from '@ftsukic/tsuki'
import type { MotionConfig } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

const modes: readonly { label: string; motion: MotionConfig }[] = [
  { label: '跟随系统', motion: { enabled: true, reducedMotion: 'system', durationScale: 1 } },
  { label: '关闭动画', motion: { enabled: false } },
  { label: '减弱动态', motion: { enabled: true, reducedMotion: 'always' } },
  { label: '慢速磁吸', motion: { enabled: true, reducedMotion: 'never', durationScale: 2 } },
]

/**
 * @title 动画策略
 * @description 切换统一 Motion 配置，观察气泡按压反馈和松手磁吸。
 */
export default function FloatingBubbleMotionExample() {
  const [mode, setMode] = useState(0)
  return (
    <View style={styles.page}>
      <Text>当前：{modes[mode].label}。拖动气泡后松手查看磁吸效果。</Text>
      <View style={styles.buttons}>
        {modes.map(({ label }, index) => (
          <Button key={label} size="small" onPress={() => setMode(index)}>
            {label}
          </Button>
        ))}
      </View>
      <ConfigProvider theme={{ motion: modes[mode].motion }}>
        <FloatingBubble
          axis="xy"
          magnetic="x"
          defaultOffset={{ x: 140, y: 280 }}
          accessibilityLabel="动画策略浮动气泡"
        >
          <Text style={styles.bubbleText}>吸</Text>
        </FloatingBubble>
      </ConfigProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 440, padding: 20, gap: 12 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bubbleText: { color: '#ffffff' },
})
