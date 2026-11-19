/**
 * @title Theme
 * @description Reads locally resolved Input size and radius for native styles.
 */
import { ConfigProvider, Input, useTsukiTheme } from '@ftsukic/tsuki'

function ScopedInput() {
  const { components, semantic } = useTsukiTheme()
  return (
    <Input
      accessibilityLabel="Themed input"
      placeholder="Scoped input"
      style={{ ...components.Input, borderColor: semantic.colorPrimary }}
    />
  )
}

export default function Theme() {
  return (
    <ConfigProvider
      theme={{
        semantic: { colorPrimary: '#6d28d9' },
        components: { Input: { height: 52, borderRadius: 14 } },
      }}
    >
      <ScopedInput />
    </ConfigProvider>
  )
}
