/**
 * @title TextCascade
 * @description Demonstrates Button text cascade.
 */
import { Button } from '../../button'
import { Text } from '../../../text'

export default function TextCascade() {
  return (
    <>
      <Button>
        <Text>Default</Text>
      </Button>
      <Button variant="solid">
        <Text>Primary</Text>
      </Button>
      <Button variant="outlined">
        <Text>Outlined</Text>
      </Button>
    </>
  )
}
