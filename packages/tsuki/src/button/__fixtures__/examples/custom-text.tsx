/**
 * @title CustomText
 * @description Demonstrates Button custom text.
 */
import { Button } from '../../button'
import { Text } from '../../../text'

export default function CustomText() {
  return (
    <Button variant="solid">
      <Text className="text-red-500">Custom</Text>
    </Button>
  )
}
