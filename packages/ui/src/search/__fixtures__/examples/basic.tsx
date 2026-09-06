/**
 * @title 组件预览
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
