/**
 * @title 组件预览
 * @description 展示成功状态、标题和补充说明。
 */
import { Result, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function ResultOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Result status="success" title="操作成功" />
      </View>
    </ThemeProvider>
  )
}
