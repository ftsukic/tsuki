/**
 * @title Space · alignment
 * @description 展示 Space 的真实公开 API 和可交互状态。
 */
import { Space } from '@ftsukic/react-native-ui'
import { Text } from 'react-native'

export default function Example() {
  return (
    <Space gap="m">
      <Text>第一项</Text>
      <Text>第二项</Text>
      <Text>第三项</Text>
    </Space>
  )
}
