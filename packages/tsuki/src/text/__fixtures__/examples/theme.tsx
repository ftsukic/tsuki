/**
 * @title Theme
 * @description Shows the resolved primary color for this theme scope.
 */
import { Text } from '../../index'
import { ConfigProvider, useTsukiTheme } from '../../../theme'

function ThemeText() {
  const { semantic } = useTsukiTheme()
  return (
    <Text style={{ color: semantic.colorPrimary, backgroundColor: semantic.colorBackground }}>
      Theme primary
    </Text>
  )
}

export default function Theme() {
  return (
    <ConfigProvider theme={{ semantic: { colorPrimary: '#7c3aed' } }}>
      <ThemeText />
    </ConfigProvider>
  )
}
