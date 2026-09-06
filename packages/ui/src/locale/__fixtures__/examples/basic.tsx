/**
 * @title LocaleProvider 组件预览
 * @description LocaleProvider 提供组件默认文案。
 */
import { LocaleProvider } from '@ftsukic/react-native-ui'
import { Text } from 'react-native'

export default function Example() {
  return (
    <LocaleProvider>
      <Text>Locale 内容</Text>
    </LocaleProvider>
  )
}
