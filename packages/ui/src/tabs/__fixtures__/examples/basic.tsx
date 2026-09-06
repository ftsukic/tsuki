/**
 * @title 组件预览
 * @description 使用 Tabs.TabPane 组织标签页内容并延迟渲染非活动面板。
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
