import { memo } from 'react'

import { Portal } from '../portal'
import { InteractionCoordinator } from '../interaction'
import { ConfigProvider } from '../theme'
import { GestureProvider, SafeAreaProvider } from './capabilities'
import type { ProviderProps } from './interface'

export const Provider = memo(function Provider({
  children,
  gesture = false,
  safeArea = false,
  theme,
}: ProviderProps) {
  return (
    <SafeAreaProvider enabled={safeArea}>
      <GestureProvider enabled={gesture}>
        <ConfigProvider theme={theme}>
          <InteractionCoordinator>
            <Portal.Host>{children}</Portal.Host>
          </InteractionCoordinator>
        </ConfigProvider>
      </GestureProvider>
    </SafeAreaProvider>
  )
})

Provider.displayName = 'Provider'

export type { ProviderProps } from './interface'
export { GestureProvider, SafeAreaProvider } from './capabilities'
export type { GestureProviderProps, SafeAreaProviderProps } from './capabilities'
