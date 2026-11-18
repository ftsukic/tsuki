/**
 * @title theme
 * @description Demonstrates Surface theme.
 */
import { Text } from 'react-native'
import { Surface } from '../..'
import { ConfigProvider } from '../../../theme'

export default function Theme() {
  return (
    <ConfigProvider
      theme={{
        semantic: { colorSurface: '#ede9fe' },
        components: { Surface: { padding: 24, borderRadius: 20 } },
      }}
    >
      <Surface bordered>
        <Text>Local theme</Text>
      </Surface>
    </ConfigProvider>
  )
}
