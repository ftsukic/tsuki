/**
 * @title 组件预览
 */
import { NumberInput, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function NumberInputOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <NumberInput defaultValue={10} />
      </View>
    </ThemeProvider>
  )
}
