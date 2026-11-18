/**
 * @title Theme
 * @description Demonstrates Divider theme.
 */
import { Divider } from '../..'
import { ConfigProvider, TsukiProvider } from '../../../theme'

export default function Theme() {
  return (
    <TsukiProvider scheme="light" theme={{ semantic: { colorBorder: '#7c3aed' } }}>
      <ConfigProvider theme={{ components: { Divider: { thickness: 4 } } }}>
        <Divider />
      </ConfigProvider>
    </TsukiProvider>
  )
}
