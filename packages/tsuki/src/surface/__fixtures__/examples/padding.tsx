/**
 * @title padding
 * @description Demonstrates Surface padding.
 */
import { Text } from 'react-native'
import { Surface } from '../..'

export default function Padding() {
  return (
    <Surface padding={24}>
      <Text>24 dp padding</Text>
    </Surface>
  )
}
