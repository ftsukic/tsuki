/**
 * @title 组件预览
 * @description 展示基于 Popup 的选择器及其工具栏配置。
 */
import { Picker, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function PickerOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Picker visible={false} columns={[[{ value: 'a', label: '选项 A' }]]} />
      </View>
    </ThemeProvider>
  )
}
