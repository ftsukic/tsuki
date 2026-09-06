/**
 * @title 组件预览
 */
import { Empty, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function EmptyOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Empty text="暂无数据" />
      </View>
    </ThemeProvider>
  )
}
