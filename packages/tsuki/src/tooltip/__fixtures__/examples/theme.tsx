/**
 * @title Theme and NativeWind
 * @description Overrides semantic theme colors and a content slot for the Tooltip bubble.
 */
import { ConfigProvider, Tooltip } from '@ftsukic/tsuki'
import { Text } from 'react-native'

export default function TooltipTheme() {
  return (
    <ConfigProvider
      theme={{ semantic: { colorForeground: '#172554', colorBackground: '#dbeafe' } }}
    >
      <Tooltip
        classNames={{ content: 'border border-blue-300', text: 'font-semibold' }}
        content="Theme tokens and NativeWind classes apply to the bubble."
        trigger="press"
      >
        <Text>Open themed hint</Text>
      </Tooltip>
    </ConfigProvider>
  )
}
