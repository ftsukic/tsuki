/**
 * @title 组件预览
 * @description 展示搜索输入、提交事件和可选的搜索按钮。
 */
import { Search, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function SearchOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Search placeholder="搜索" />
      </View>
    </ThemeProvider>
  )
}
