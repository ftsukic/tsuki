import { memo, useMemo, useRef } from 'react'

import { Portal } from '../portal'
import { SwipeCellContext, SwipeCellPressContext } from '../swipe-cell/context'
import { SwipeCellManager } from '../swipe-cell/manager'
import { ConfigProvider } from '../theme'
import { definedValues } from '../theme/resolve-theme'
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

  const resolvedTheme = useMemo(
    () => (motion ? { ...theme, motion: { ...theme?.motion, ...definedValues(motion) } } : theme),
    [theme, motion],
  )

  return (
    <SafeAreaProvider enabled={safeArea}>
      <GestureProvider enabled={gesture}>
        <ConfigProvider theme={resolvedTheme}>
          <SwipeCellContext.Provider value={swipeCellManager}>
            <SwipeCellPressContext.Provider value={null}>
              <Portal.Host>{children}</Portal.Host>
            </SwipeCellPressContext.Provider>
          </SwipeCellContext.Provider>
        </ConfigProvider>
      </GestureProvider>
    </SafeAreaProvider>
  )
})

Provider.displayName = 'Provider'
