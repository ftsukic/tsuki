/**
 * @title Custom Text
 * @description Demonstrates Button custom text.
 */

import { Button, Text } from '@ftsukic/tsuki'

export default function CustomText() {
  return (
    <Button variant="outlined">
      <Text className="text-tsuki-danger">Custom</Text>
    </Button>
  )
}
