/**
 * @title 组件预览
 */
import { Card, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function CardOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Card title="卡片">内容</Card>
      </View>
    </ThemeProvider>
  )
}
