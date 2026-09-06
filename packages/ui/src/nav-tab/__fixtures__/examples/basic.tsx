/**
 * @title 组件预览
 * @description 使用 options 和受控值切换导航标签。
 */
import { NavTab, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function NavTabOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <NavTab options={[{ value: 'all', label: '全部' }]} defaultValue="all" />
      </View>
    </ThemeProvider>
  )
}
