import { FloatingBubble, Icon, Text } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 语义样式
 * @description root、content、icon 分别定制气泡、内容和图标区域，拖动时显示强调边框。
 */
export default function FloatingBubbleSemanticExample() {
  return (
    <View style={styles.page}>
      <Text>拖动气泡查看 state.dragging 的边框变化。</Text>
      <FloatingBubble
        axis="xy"
        icon={<Icon name="CustomerServiceOutlined" />}
        accessibilityLabel="语义样式浮动气泡"
        style={styles.root}
        styles={({ state }) => ({
          root: { borderWidth: state.dragging ? 3 : 1, borderColor: '#f59e0b' },
          content: styles.content,
          icon: styles.icon,
        })}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 420, padding: 20 },
  root: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#102a43' },
  content: { padding: 6 },
  icon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#243b53' },
})
