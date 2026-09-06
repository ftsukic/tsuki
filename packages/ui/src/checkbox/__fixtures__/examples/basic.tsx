/**
 * @title 组件预览
 * @description 展示单个复选框的默认值、标签和选中状态。
 */
import { Checkbox, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function CheckboxOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Checkbox label="同意" />
      </View>
    </ThemeProvider>
  )
}
