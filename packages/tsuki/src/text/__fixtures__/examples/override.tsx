/**
 * @title Override
 * @description Demonstrates Text override.
 */

import { Text, TextClassContext } from '@ftsukic/tsuki'

export default function Override() {
  return (
    <TextClassContext.Provider value="text-tsuki-primary">
      <Text className="text-red-500">Override</Text>
    </TextClassContext.Provider>
  )
}
