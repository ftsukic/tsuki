import { FloatingPanel, Provider } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 主题定制
 * @description 通过 FloatingPanel token 和 semantic styles 定制面板背景、圆角和拖拽条。
 */
export default function FloatingPanelThemeExample() {
  return (
    <Provider
      theme={{
        components: {
          FloatingPanel: {
            backgroundColor: '#102a43',
            borderRadius: 20,
            barColor: '#9fb3c8',
          },
        },
      }}
    >
      <View style={styles.page}>
        <FloatingPanel
          styles={{
            content: { backgroundColor: '#102a43' },
            contentContainer: { paddingHorizontal: 24 },
          }}
        >
          <View style={styles.content}>
            <Text style={styles.title}>主题化 FloatingPanel</Text>
            <Text style={styles.description}>
              token 控制默认外观，semantic styles 负责局部覆盖。
            </Text>
          </View>
        </FloatingPanel>
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 360, backgroundColor: '#f7f8fa' },
  content: { gap: 8, padding: 20 },
  title: { color: '#f0f4f8', fontSize: 16, fontWeight: '600' },
  description: { color: '#d9e2ec', lineHeight: 22 },
})
