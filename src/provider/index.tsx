import { memo } from 'react'

import { Portal } from '../portal'
import { InteractionCoordinator } from '../interaction'
import { ConfigProvider } from '../theme'
import { GestureProvider } from './capabilities'
import type { ProviderProps } from './interface'

export const Provider = memo(function Provider({
  children,
  gesture = false,
  theme,
}: ProviderProps) {
  return (
    <GestureProvider enabled={gesture}>
      <ConfigProvider theme={theme}>
        <InteractionCoordinator>
          <Portal.Host>{children}</Portal.Host>
        </InteractionCoordinator>
      </ConfigProvider>
    </GestureProvider>
  )
})

Provider.displayName = 'Provider'

export type { ProviderProps } from './interface'
export { GestureProvider } from './capabilities'
export type { GestureProviderProps } from './capabilities'
