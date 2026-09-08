import { BottomBar, Button } from '../../..'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * @title 自定义样式
 * @description 通过 BottomBar 的根 style 覆盖背景、圆角和水平间距。
 */
export default function BottomBarCustomStyleFixture() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>自定义样式</Text>
        <Text>BottomBar 不提供 Card 或 Surface 语义，视觉覆盖通过 style 完成。</Text>
      </ScrollView>
      <BottomBar
        style={{
          backgroundColor: '#102a43',
          borderTopWidth: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingHorizontal: 12,
        }}
      >
        <Button style={styles.customButton} type="primary">
          保存
        </Button>
      </BottomBar>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f7f8fa',
  },
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '600',
  },
  customButton: {
    flex: 1,
  },
})
