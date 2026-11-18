/**
 * @title DeepNested
 * @description Demonstrates Text deep nested.
 */
import { Text } from '../../index'

export default function DeepNested() {
  return (
    <Text>
      Level 1{' '}
      <Text>
        level 2 <Text className="text-tsuki-primary">level 3</Text>
      </Text>
    </Text>
  )
}
