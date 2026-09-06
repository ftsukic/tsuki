/**
 * @title 组件预览
 */
import { ButtonBar, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function ButtonBarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <ButtonBar buttons={[{ text: '确定' }]} />
      </View>
    </ThemeProvider>
  )
}
