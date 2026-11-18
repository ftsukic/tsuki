/**
 * @title Nested
 * @description Demonstrates Text nested.
 */
import { Text } from '../../index'

export default function Nested() {
  return (
    <Text>
      Hello <Text className="font-bold">World</Text>
    </Text>
  )
}
