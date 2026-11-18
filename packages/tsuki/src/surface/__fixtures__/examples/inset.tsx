/**
 * @title inset
 * @description Demonstrates Surface inset.
 */
import { Text } from 'react-native'
import { Surface } from '../..'

export default function Inset() {
  return (
    <Surface inset>
      <Text>Inset surface</Text>
    </Surface>
  )
}
