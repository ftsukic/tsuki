/**
 * @title 组件预览
 * @description 使用 options 和默认值展示侧边栏导航。
 */
import { Sidebar, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function SidebarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Sidebar options={[{ value: 'a', label: '菜单 A' }]} />
      </View>
    </ThemeProvider>
  )
}
