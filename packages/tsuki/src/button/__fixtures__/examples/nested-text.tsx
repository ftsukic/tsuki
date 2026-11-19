/**
 * @title Nested Text
 * @description Demonstrates Button nested text.
 */

import { Button, Text } from '@ftsukic/tsuki'

export default function NestedText() {
  return (
    <Button variant="solid">
      <Text>
        Confirm <Text className="font-bold">deletion</Text>
      </Text>
    </Button>
  )
}
