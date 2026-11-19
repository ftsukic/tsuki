/**
 * @title Dark Mode
 * @description Shows the resolved primary color for this theme scope.
 */

import { Text, TsukiProvider, useTsukiTheme } from '@ftsukic/tsuki'

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
