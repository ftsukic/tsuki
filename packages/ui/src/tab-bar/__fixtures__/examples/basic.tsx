/**
 * @title 组件预览
 */
import { TabBar, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function TabBarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <TabBar options={[{ value: 'home', label: '首页' }]} defaultValue="home" />
      </View>
    </ThemeProvider>
  )
}
