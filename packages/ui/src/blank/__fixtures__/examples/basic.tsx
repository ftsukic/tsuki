/**
 * @title 组件预览
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
