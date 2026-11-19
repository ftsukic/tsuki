/**
 * @title Wrapping
 * @description Demonstrates wrapping with Space.
 */
import { Space, Text } from '@ftsukic/tsuki'

export default function Wrap() {
  return (
    <Space gap={8} wrap style={{ width: 120 }}>
      <Text style={{ width: 80 }}>First</Text>
      <Text style={{ width: 80 }}>Second</Text>
    </Space>
  )
}
