/**
 * @title Theme
 * @description Overrides Cell tokens for a local group.
 */

import { Cell, ConfigProvider } from '@ftsukic/tsuki'

export default function Theme() {
  return (
    <ConfigProvider
      theme={{
        semantic: { colorForeground: '#7c3aed' },
        components: { Cell: { minHeight: 60, paddingHorizontal: 24 } },
      }}
    >
      <Cell title="Scoped Cell tokens" value="Local theme" />
    </ConfigProvider>
  )
}
