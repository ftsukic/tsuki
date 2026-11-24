/**
 * @title Edge placements
 * @description Exercises preferred directions and alignment; Floating flips or clamps when space is short.
 */
import { Popover } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const examples = [
  { label: 'Top', placement: 'top' },
  { label: 'Bottom', placement: 'bottom' },
  { label: 'Left', placement: 'left' },
  { label: 'Right', placement: 'right' },
] as const

export default function PopoverPlacements() {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
      {examples.map(({ label, placement }) => (
        <Popover content={`${label} placement`} key={placement} placement={placement}>
          <Text>{label}</Text>
        </Popover>
      ))}
    </View>
  )
}
