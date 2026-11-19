/**
 * @title Sizes
 * @description Compares the small, medium, and large heights.
 */
import { Button } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Sizes() {
  return (
    <View style={{ gap: 8, alignItems: 'flex-start' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </View>
  )
}
