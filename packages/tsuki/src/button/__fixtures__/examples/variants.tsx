/**
 * @title Variants
 * @description Compares solid, outlined, ghost, and link buttons.
 */
import { Button } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Variants() {
  return (
    <View style={{ gap: 8 }}>
      <Button>Solid</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="ghost">Ghost</Button>
      <View style={{ alignItems: 'flex-start' }}>
        <Button variant="link">Link</Button>
      </View>
    </View>
  )
}
