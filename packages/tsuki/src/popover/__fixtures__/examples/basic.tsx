/**
 * @title Basic Popover
 * @description Tapping the trigger opens a positioned panel; outside press and Android Back close it.
 */
import { Popover } from '@ftsukic/tsuki'
import { Text } from 'react-native'

export default function BasicPopover() {
  return (
    <Popover content="This panel is positioned relative to its trigger." placement="bottom">
      <Text>More information</Text>
    </Popover>
  )
}
