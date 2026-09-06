/**
 * @title 组件预览
 * @description 展示数值输入、最小值和最大值约束。
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
