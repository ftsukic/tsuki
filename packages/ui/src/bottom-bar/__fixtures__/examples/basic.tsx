/**
 * @title 组件预览
 * @description 展示底部栏内容、底部安全区和键盘避让相关配置。
 */
import { BottomBar, ThemeProvider } from '@ftsukic/react-native-ui'
import { Text, View } from 'react-native'

export default function BottomBarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <BottomBar>
          <Text>底部栏</Text>
        </BottomBar>
      </View>
    </ThemeProvider>
  )
}
