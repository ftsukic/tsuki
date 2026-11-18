/**
 * @title custom class
 * @description Demonstrates Surface custom class.
 */
import { Text } from 'react-native'
import { Surface } from '../..'

export default function CustomClass() {
  return (
    <Surface className="bg-violet-100 rounded-xl p-6 border-2 border-violet-400">
      <Text>NativeWind surface</Text>
    </Surface>
  )
}
