import { memo } from 'react'
import { NotifyProvider } from '../notify/provider'
import { Portal } from '../portal'
import { ConfigProvider } from '../theme'
import type { ProviderProps } from './interface'

export const Provider = memo(function Provider({ children, theme }: ProviderProps) {
  return (
    <ConfigProvider theme={theme}>
      <Portal.Host>
        <NotifyProvider>{children}</NotifyProvider>
      </Portal.Host>
    </ConfigProvider>
  )
})

Provider.displayName = 'Provider'

export type { ProviderProps } from './interface'
