import { BottomBar, Button, TextInput } from '../../..'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * @title 输入操作区
 * @description 将 TextInput 和 Button 作为任意 children 组合到页面底部。
 */
export default function BottomBarInputFixture() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>输入操作区</Text>
        <Text>BottomBar 不实现输入或提交逻辑，只提供底部布局空间。</Text>
      </ScrollView>
      <BottomBar>
        <TextInput style={styles.input} bordered placeholder="输入内容" />
        <Button type="primary">发送</Button>
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
  input: {
    flex: 1,
    minWidth: 0,
  },
})
