import { memo, useMemo, useRef } from 'react'

import { ImperativePortalRenderer } from '../portal/imperative'
import { BackgroundScrollLockContext, createScrollLockStore } from '../portal/scroll-lock'
import { ConfigProvider } from '../theme'
import { definedValues } from '../theme/resolve-theme'
import { GestureProvider } from './gesture-provider'
import { SafeAreaProvider } from './safe-area-provider'
import type { TsukiProviderProps } from './types'

export const TsukiProvider = memo(function TsukiProvider({
  children,
  gesture = true,
  safeArea = false,
  theme,
  motion,
}: TsukiProviderProps) {
  const scrollLock = useRef(createScrollLockStore()).current

  const resolvedTheme = useMemo(
    () => (motion ? { ...theme, motion: { ...theme?.motion, ...definedValues(motion) } } : theme),
    [theme, motion],
  )

  return (
    <SafeAreaProvider enabled={safeArea}>
      <GestureProvider enabled={gesture}>
        <ConfigProvider theme={resolvedTheme}>
          <BackgroundScrollLockContext.Provider value={scrollLock}>
            <ImperativePortalRenderer />
            {children}
          </BackgroundScrollLockContext.Provider>
        </ConfigProvider>
      </GestureProvider>
    </SafeAreaProvider>
  )
})

TsukiProvider.displayName = 'TsukiProvider'

/** @deprecated Use TsukiProvider. */
export const Provider = TsukiProvider
