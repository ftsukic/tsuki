/**
 * @title Theme Bridge
 * @description Resolves the calling ConfigProvider theme inside the root Host.
 */
import { useState } from 'react'
import { Button, ConfigProvider, Portal, Surface, Text, useTsukiTheme } from '@ftsukic/tsuki'

function ThemeLabel() {
  const theme = useTsukiTheme()
  return (
    <Text>
      Portal theme: {theme.scheme} / {theme.semantic.colorPrimary}
    </Text>
  )
}

export default function PortalTheme() {
  const [alternate, setAlternate] = useState(false)

  return (
    <ConfigProvider theme={{ semantic: { colorPrimary: alternate ? '#0e7490' : '#c026d3' } }}>
      <Portal>
        <Surface className="mt-3" bordered>
          <Button className="mb-3" onPress={() => setAlternate((value) => !value)} size="small">
            Switch Portal theme
          </Button>
          <ThemeLabel />
        </Surface>
      </Portal>
    </ConfigProvider>
  )
}
