import { BottomBar, Button } from '../../..'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * @title 基础用法
 * @description BottomBar 固定在页面根容器底部，任意 children 由调用方组合。
 */
export default function BottomBarBasicFixture() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>页面内容</Text>
        <Text>BottomBar 应与滚动内容保持 sibling 关系。</Text>
        <Text>页面内容需要自行预留底部空间，避免被固定容器遮挡。</Text>
      </ScrollView>
      <BottomBar>
        <View style={styles.message}>
          <Text style={styles.messageText}>任意操作区域</Text>
        </View>
        <Button type="primary">继续</Button>
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
    paddingBottom: 120,
  },
  title: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '600',
  },
  message: {
    flex: 1,
    minWidth: 0,
  },
  messageText: {
    color: '#68788d',
    fontSize: 14,
  },
})
