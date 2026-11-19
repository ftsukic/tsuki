/**
 * @title Loading and disabled
 * @description Shows the busy indicator and the disabled state.
 */
import { Button } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function States() {
  return (
    <View style={{ gap: 8 }}>
      <Button loading>Saving</Button>
      <Button disabled variant="outlined">
        Unavailable
      </Button>
    </View>
  )
}
