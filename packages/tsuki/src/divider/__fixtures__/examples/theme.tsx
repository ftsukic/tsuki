/**
 * @title Theme
 * @description Demonstrates Divider theme.
 */

import { ConfigProvider, Divider } from '@ftsukic/tsuki'

export default function Theme() {
  return (
    <ConfigProvider
      theme={{ semantic: { colorBorder: '#7c3aed' }, components: { Divider: { thickness: 4 } } }}
    >
      <Divider />
    </ConfigProvider>
  )
}
