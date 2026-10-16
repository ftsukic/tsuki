import { memo, useMemo, useRef } from 'react'

import { PortalHost } from '../portal/portal-host'
import { SwipeCellContext, SwipeCellPressContext } from '../swipe-cell/context'
import { SwipeCellManager } from '../swipe-cell/manager'
import { ConfigProvider } from '../theme'
import { definedValues } from '../theme/resolve-theme'
import { GestureProvider } from './gesture-provider'
import { SafeAreaProvider } from './safe-area-provider'
import type { TsukiProviderProps } from './types'

export const TsukiProvider = memo(function TsukiProvider({
  children,
  teleport = false,
  portalBackend,
  gesture = true,
  safeArea = false,
  theme,
  motion,
}: TsukiProviderProps) {
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
              <PortalHost portalBackend={portalBackend} teleport={teleport}>
                {children}
              </PortalHost>
            </SwipeCellPressContext.Provider>
          </SwipeCellContext.Provider>
        </ConfigProvider>
      </GestureProvider>
    </SafeAreaProvider>
  )
})

TsukiProvider.displayName = 'TsukiProvider'

/** @deprecated Use TsukiProvider. */
export const Provider = TsukiProvider
