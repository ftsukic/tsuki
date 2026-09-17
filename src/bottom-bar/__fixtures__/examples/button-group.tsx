import { BottomBar, Button } from '../../..'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * @title 底部按钮组
 * @description 使用 Button.Group block 在 BottomBar 中展示等宽按钮。
 */
export default function BottomBarButtonGroupFixture() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>底部按钮组</Text>
        <Text>Button.Group 负责按钮之间的连接和等宽布局。</Text>
      </ScrollView>
      <BottomBar>
        <Button.Group block>
          <Button>取消</Button>
          <Button type="primary">确认</Button>
        </Button.Group>
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
