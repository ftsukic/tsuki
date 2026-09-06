/**
 * @title 组件预览
 */
import { NoticeBar, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function NoticeBarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <NoticeBar message="这是一条通知" />
      </View>
    </ThemeProvider>
  )
}
