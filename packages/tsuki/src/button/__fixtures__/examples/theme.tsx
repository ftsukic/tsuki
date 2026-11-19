/**
 * @title Theme
 * @description Reads locally resolved Button tokens for native styles.
 */
import { Button, ConfigProvider, useTsukiTheme } from '@ftsukic/tsuki'

function ScopedButton() {
  const { components, semantic } = useTsukiTheme()
  return (
    <Button
      style={{ ...components.Button, backgroundColor: semantic.colorPrimary }}
      styles={{ content: { color: semantic.colorPrimaryForeground } }}
    >
      Scoped action
    </Button>
  )
}

export default function Theme() {
  return (
    <ConfigProvider
      theme={{
        semantic: { colorPrimary: '#6d28d9', colorPrimaryForeground: '#ffffff' },
        components: { Button: { height: 54, borderRadius: 16 } },
      }}
    >
      <ScopedButton />
    </ConfigProvider>
  )
}
