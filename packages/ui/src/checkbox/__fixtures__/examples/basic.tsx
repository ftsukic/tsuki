/**
 * @title 组件预览
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
