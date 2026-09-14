import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FloatingBubble, Icon, Text } from '@ftsukic/tsuki'

/**
 * @title 基础用法
 * @description FloatingBubble 默认停靠在视口右下区域，点击后更新页面反馈。
 */
export default function FloatingBubbleBasicExample() {
  const [message, setMessage] = useState('点击气泡')

  return (
    <View style={styles.page}>
      <Text style={styles.title}>页面内容</Text>
      <Text style={styles.description}>气泡通过 Portal 脱离当前页面布局，默认只允许纵向拖动。</Text>
      <Text style={styles.message}>{message}</Text>
      <FloatingBubble
        accessibilityLabel="打开客服"
        icon={<Icon name="CustomerServiceOutlined" size={24} color="#ffffff" />}
        onPress={() => setMessage('已点击客服气泡')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 420, gap: 12, backgroundColor: '#f7f8fa', padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  message: { color: '#1677ff', fontWeight: '600' },
})
