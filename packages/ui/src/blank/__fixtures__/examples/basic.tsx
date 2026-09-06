/**
 * @title 组件预览
 * @description 使用 edge 属性为容器添加主题间距。
 */
import { Blank, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function BlankOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Blank top bottom />
      </View>
    </ThemeProvider>
  )
}
