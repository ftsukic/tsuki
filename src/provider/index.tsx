import { memo } from 'react'

import { Portal } from '../portal'
import { InteractionCoordinator } from '../interaction'
import { ConfigProvider } from '../theme'
import type { ProviderProps } from './interface'

export const Provider = memo(function Provider({ children, theme }: ProviderProps) {
  return (
    <ConfigProvider theme={theme}>
      <InteractionCoordinator>
        <Portal.Host>{children}</Portal.Host>
      </InteractionCoordinator>
    </ConfigProvider>
  )
})

Provider.displayName = 'Provider'

export type { ProviderProps } from './interface'
