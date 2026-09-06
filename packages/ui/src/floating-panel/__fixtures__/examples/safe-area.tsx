import { FloatingPanel } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 底部安全区
 * @description safeAreaInsetBottom 默认开启，只增加内容底部 padding，不改变面板锚点高度。
 */
export default function FloatingPanelSafeAreaExample() {
  return (
    <View style={styles.page}>
      <FloatingPanel safeAreaInsetBottom>
        <View style={styles.content}>
          <Text style={styles.title}>安全区适配</Text>
          <Text style={styles.description}>
            在带有 Home Indicator 的设备上，内容底部会自动留出安全距离。
          </Text>
        </View>
      </FloatingPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 360, backgroundColor: '#f7f8fa' },
  content: { gap: 8, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
})
