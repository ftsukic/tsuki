/**
 * @title Orientation
 * @description Demonstrates Divider orientation.
 */
import { Divider } from '../..'
import { Text } from 'react-native'
import { Space } from '../../../space'

export default function Orientation() {
  return (
    <Space gap={8} style={{ height: 48 }}>
      <Text>Before</Text>
      <Divider orientation="vertical" inset={6} />
      <Text>After</Text>
    </Space>
  )
}
