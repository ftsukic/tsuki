/**
 * @title Native Wind overrides
 * @description Demonstrates nativewind overrides with Space.
 */
import { Space, Text } from '@ftsukic/tsuki'

export default function CustomClass() {
  return (
    <Space gap={8} className="flex-col gap-4">
      <Text>First</Text>
      <Text>Second</Text>
    </Space>
  )
}
