/**
 * @title 组件预览
 */
import { NavBar, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function NavBarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <NavBar title="页面标题" />
      </View>
    </ThemeProvider>
  )
}
