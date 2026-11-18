/**
 * @title Horizontal spacing
 * @description Demonstrates horizontal spacing with Space.
 */
import { Text } from 'react-native'
import { Space } from '../..'

export default function Basic() {
  return (
    <Space gap={8}>
      <Text>First</Text>
      <Text>Second</Text>
    </Space>
  )
}
