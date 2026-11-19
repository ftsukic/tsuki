/**
 * @title Theme
 */
import { Cell } from '../..'
import { ConfigProvider } from '../../../theme'

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
