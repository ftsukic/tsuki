import { memo, useRef } from 'react'

import { Portal } from '../portal'
import { InteractionCoordinator } from '../interaction'
import { SwipeCellContext } from '../swipe-cell/context'
import { SwipeCellManager } from '../swipe-cell/manager'
import { ConfigProvider } from '../theme'
import { GestureProvider, SafeAreaProvider } from './capabilities'
import type { ProviderProps } from './interface'

export const Provider = memo(function Provider({
  children,
  gesture = true,
  safeArea = false,
  theme,
}: ProviderProps) {
  const swipeCellManager = useRef(new SwipeCellManager()).current

  return (
    <SafeAreaProvider enabled={safeArea}>
      <GestureProvider enabled={gesture}>
        <ConfigProvider theme={theme}>
          <SwipeCellContext.Provider value={swipeCellManager}>
            <InteractionCoordinator manager={swipeCellManager}>
              <Portal.Host>{children}</Portal.Host>
            </InteractionCoordinator>
          </SwipeCellContext.Provider>
        </ConfigProvider>
      </GestureProvider>
    </SafeAreaProvider>
  )
})

Provider.displayName = 'Provider'

export type { ProviderProps } from './interface'
export { GestureProvider, SafeAreaProvider } from './capabilities'
export type { GestureProviderProps, SafeAreaProviderProps } from './capabilities'
