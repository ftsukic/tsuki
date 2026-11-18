/**
 * @title NestedText
 * @description Demonstrates Button nested text.
 */
import { Button } from '../../button'
import { Text } from '../../../text'

export default function NestedText() {
  return (
    <Button variant="solid">
      <Text>
        Confirm <Text className="font-bold">deletion</Text>
      </Text>
    </Button>
  )
}
