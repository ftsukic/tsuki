/**
 * @title NativeWind overrides
 * @description Demonstrates nativewind overrides with Space.
 */
import { Text } from 'react-native'
import { Space } from '../..'

export default function CustomClass() {
  return (
    <Space gap={8} className="flex-col gap-4">
      <Text>First</Text>
      <Text>Second</Text>
    </Space>
  )
}
