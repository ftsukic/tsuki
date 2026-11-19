/**
 * @title Custom class
 * @description Demonstrates Surface custom class.
 */
import { Surface, Text } from '@ftsukic/tsuki'

export default function CustomClass() {
  return (
    <Surface className="bg-violet-100 rounded-xl p-6 border-2 border-violet-400">
      <Text className="text-violet-900">NativeWind surface</Text>
    </Surface>
  )
}
