/**
 * @title Alignment
 * @description Centers children with different heights along the cross axis.
 */
import { Space, Surface, Text } from '@ftsukic/tsuki'

export default function Alignment() {
  return (
    <Space align="center" gap={12}>
      <Surface padding={8} bordered>
        <Text>Short</Text>
      </Surface>
      <Surface padding={24} bordered>
        <Text>Tall</Text>
      </Surface>
    </Space>
  )
}
