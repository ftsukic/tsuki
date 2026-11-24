/**
 * @title Long-press hint
 * @description Shows an informational Tooltip on long press without an outside hit-test layer.
 */
import { Tooltip } from '@ftsukic/tsuki'
import { Text } from 'react-native'

export default function BasicTooltip() {
  return (
    <Tooltip content="Long press reveals this short hint." testID="tooltip-basic-trigger">
      <Text accessibilityRole="text">Press and hold for help</Text>
    </Tooltip>
  )
}
