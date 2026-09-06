/**
 * @title 组件预览
 */
import { Description, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function DescriptionOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Description label="姓名" text="小明" />
      </View>
    </ThemeProvider>
  )
}
