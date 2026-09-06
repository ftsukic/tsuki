/**
 * @title 组件预览
 * @description 展示带显示和隐藏密码操作的输入框。
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
