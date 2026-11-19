/**
 * @title Text Cascade
 * @description Demonstrates Button text cascade.
 */

import { Button, Text } from '@ftsukic/tsuki'

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
