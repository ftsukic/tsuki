/**
 * @title Placements and rich content
 * @description Tap each trigger to inspect alignment and placement near the fixture edges.
 */
import { Tooltip } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const rows = [
  [
    { label: 'Top left', placement: 'top-start' },
    { label: 'Top right', placement: 'top-end' },
  ],
  [
    { label: 'Bottom left', placement: 'bottom-start' },
    { label: 'Bottom right', placement: 'bottom-end' },
  ],
] as const

export default function TooltipPlacements() {
  return (
    <View style={{ height: 740, justifyContent: 'space-between', padding: 8 }}>
      {rows.map((row) => (
        <View
          key={row[0].placement}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
        >
          {row.map(({ label, placement }) => (
            <Tooltip
              content={`${label}: the floating bubble flips or shifts to stay within the screen.`}
              key={placement}
              placement={placement}
              trigger="press"
            >
              <Text>{label}</Text>
            </Tooltip>
          ))}
        </View>
      ))}
    </View>
  )
}
