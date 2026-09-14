import { ConfigProvider, FloatingBubble, Text } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 主题定制
 * @description 通过 FloatingBubble token 和 semantic styles 定制尺寸、背景、阴影和内容样式。
 */
export default function FloatingBubbleThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          FloatingBubble: {
            size: 56,
            borderRadius: 16,
            backgroundColor: '#102a43',
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          },
        },
      }}
    >
      <View style={styles.page}>
        <Text style={styles.title}>主题化 FloatingBubble</Text>
        <Text style={styles.description}>
          token 控制默认外观，semantic styles 负责局部内容覆盖。
        </Text>
        <FloatingBubble
          axis="xy"
          styles={{ content: styles.content, icon: styles.icon }}
          accessibilityLabel="主题化浮动气泡"
        >
          <Text style={styles.bubbleText}>主题</Text>
        </FloatingBubble>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 440, gap: 12, backgroundColor: '#f7f8fa', padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  content: { backgroundColor: '#243b53' },
  icon: { borderRadius: 4 },
  bubbleText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
})
