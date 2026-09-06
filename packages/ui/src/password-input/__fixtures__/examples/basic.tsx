/**
 * @title 组件预览
 */
import { PasswordInput, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function PasswordInputOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <PasswordInput placeholder="密码" />
      </View>
    </ThemeProvider>
  )
}
