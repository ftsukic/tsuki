/**
 * @title Provider 组件预览
 * @description Provider 为主题、语言和 Portal 提供统一上下文。
 */
import { Provider } from '@ftsukic/react-native-ui'
import { Text } from 'react-native'

export default function Example() {
  return (
    <Provider>
      <Text>Provider 内容</Text>
    </Provider>
  )
}
