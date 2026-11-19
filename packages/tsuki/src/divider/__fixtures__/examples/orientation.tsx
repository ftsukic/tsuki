/**
 * @title Orientation
 * @description Demonstrates Divider orientation.
 */
import { Divider, Space, Text } from '@ftsukic/tsuki'

export default function Orientation() {
  return (
    <Space gap={8} style={{ height: 48 }}>
      <Text>Before</Text>
      <Divider orientation="vertical" thickness={2} inset={6} />
      <Text>After</Text>
    </Space>
  )
}
