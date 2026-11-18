/**
 * @title DarkMode
 * @description Shows the resolved primary color for this theme scope.
 */
import { Text } from '../../index'
import { TsukiProvider, useTsukiTheme } from '../../../theme'

function ThemeText() {
  const { semantic } = useTsukiTheme()
  return (
    <Text style={{ color: semantic.colorPrimary, backgroundColor: semantic.colorBackground }}>
      Theme primary
    </Text>
  )
}

export default function DarkMode() {
  return (
    <TsukiProvider scheme="dark">
      <ThemeText />
    </TsukiProvider>
  )
}
