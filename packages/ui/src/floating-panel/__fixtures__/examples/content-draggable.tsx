import { FloatingPanel } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 仅拖动头部
 * @description contentDraggable=false 时，面板只能通过 header 拖动，内容区域保留 ScrollView 滚动。
 */
export default function FloatingPanelContentDraggableExample() {
  return (
    <View style={styles.page}>
      <FloatingPanel contentDraggable={false}>
        <View style={styles.content}>
          <Text style={styles.title}>内容区域独立滚动</Text>
          {Array.from({ length: 12 }, (_, index) => (
            <Text key={index} style={styles.row}>
              内容行 {index + 1}
            </Text>
          ))}
        </View>
      </FloatingPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 360, backgroundColor: '#f7f8fa' },
  content: { gap: 8, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
  row: { color: '#68788d', lineHeight: 24 },
})
