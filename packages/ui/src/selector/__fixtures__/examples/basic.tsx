/**
 * @title 组件预览
 * @description 展示基于 Tree 选项的底部选择器。
 */
import { Selector, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function SelectorOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Selector visible={false} options={[{ value: 'a', label: '选项 A' }]} />
      </View>
    </ThemeProvider>
  )
}
