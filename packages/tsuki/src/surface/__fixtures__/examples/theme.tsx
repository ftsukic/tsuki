/**
 * @title Theme
 * @description Demonstrates Surface theme.
 */
import { ConfigProvider, Surface, Text } from '@ftsukic/tsuki'

export default function Theme() {
  return (
    <ConfigProvider
      theme={{
        semantic: { colorSurface: '#ede9fe' },
        components: { Surface: { padding: 24, borderRadius: 20 } },
      }}
    >
      <Surface bordered>
        <Text style={{ color: '#4c1d95' }}>Local theme</Text>
      </Surface>
    </ConfigProvider>
  )
}
