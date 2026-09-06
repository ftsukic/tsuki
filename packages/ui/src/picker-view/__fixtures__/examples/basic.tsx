/**
 * @title 组件预览
 */
import { PickerView, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function PickerViewOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <PickerView columns={[[{ value: 'a', label: '选项 A' }]]} />
      </View>
    </ThemeProvider>
  )
}
