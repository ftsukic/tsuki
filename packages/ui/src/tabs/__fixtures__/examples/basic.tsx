/**
 * @title 组件预览
 */
import { Tabs, ThemeProvider } from '@ftsukic/react-native-ui'
import { Text, View } from 'react-native'

export default function TabsOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Tabs>
          <Tabs.TabPane key="first" tab="第一项">
            <Text>内容</Text>
          </Tabs.TabPane>
        </Tabs>
      </View>
    </ThemeProvider>
  )
}
