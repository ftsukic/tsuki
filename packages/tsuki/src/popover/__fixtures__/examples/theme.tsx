/**
 * @title Theme and NativeWind
 * @description Applies semantic tokens and NativeWind classes to the Popover surface and text slots.
 */
import { ConfigProvider, Popover } from '@ftsukic/tsuki'
import { Text } from 'react-native'

export default function PopoverTheme() {
  return (
    <ConfigProvider theme={{ semantic: { colorPrimary: '#7c3aed', colorSurface: '#f5f3ff' } }}>
      <Popover
        classNames={{ content: 'border-violet-400', text: 'font-medium' }}
        content="The current ConfigProvider theme is used by the floating surface."
      >
        <Text>Open themed menu</Text>
      </Popover>
    </ConfigProvider>
  )
}
