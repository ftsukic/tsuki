import { BottomBar, Button } from '../../..'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * @title 底部安全区
 * @description safeAreaInsetBottom 默认开启，并把底部 inset 加入 BottomBar 内边距。
 */
export default function BottomBarSafeAreaFixture() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>底部安全区</Text>
        <Text>在有 Home Indicator 的设备上，BottomBar 内容会避开底部安全区。</Text>
      </ScrollView>
      <BottomBar safeAreaInsetBottom>
        <Button block type="primary">
          安全提交
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
})
