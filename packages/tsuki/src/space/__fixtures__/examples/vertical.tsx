/**
 * @title Vertical spacing
 * @description Demonstrates vertical spacing with Space.
 */
import { Space, Text } from '@ftsukic/tsuki'

export default function Vertical() {
  return (
    <Space direction="vertical" gap={8}>
      <Text>First</Text>
      <Text>Second</Text>
    </Space>
  )
}
