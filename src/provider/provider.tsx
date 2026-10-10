import { memo, useRef } from 'react'

import { Portal } from '../portal'
import { InteractionCoordinator } from '../interaction/interaction-coordinator'
import { SwipeCellContext } from '../swipe-cell/context'
import { SwipeCellManager } from '../swipe-cell/manager'
import { ConfigProvider } from '../theme'
import { GestureProvider } from './gesture-provider'
import { SafeAreaProvider } from './safe-area-provider'
import type { ProviderProps } from './types'

export const Provider = memo(function Provider({
  children,
  gesture = true,
  safeArea = false,
  theme,
  motion,
}: ProviderProps) {
  const swipeCellManager = useRef(new SwipeCellManager()).current

  return (
    <SafeAreaProvider enabled={safeArea}>
      <GestureProvider enabled={gesture}>
        <ConfigProvider
          theme={motion ? { ...theme, motion: { ...theme?.motion, ...motion } } : theme}
        >
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
