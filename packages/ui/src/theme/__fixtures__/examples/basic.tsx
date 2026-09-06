/**
 * @title Theme 基础用法
 * @description 使用 ThemeProvider 覆盖组件 token。
 */
import { Button, ThemeProvider } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <ThemeProvider theme={{ components: { Button: { primaryBg: '#07c160' } } }}>
      <Button text="主题按钮" type="primary" />
    </ThemeProvider>
  )
}
