import type { ReactNode } from 'react'
import { SafeAreaProvider as NativeSafeAreaProvider } from 'react-native-safe-area-context'

const defaultSafeAreaRootStyle = { flex: 1 }

export interface SafeAreaProviderProps {
  children?: ReactNode
  enabled?: boolean
}

/** Optionally provides the safe-area context required by inset-aware content. */
export function SafeAreaProvider({ children, enabled = false }: SafeAreaProviderProps): ReactNode {
  if (!enabled) {
    return children ?? null
  }

  return (
    <NativeSafeAreaProvider style={defaultSafeAreaRootStyle}>{children}</NativeSafeAreaProvider>
  )
}

SafeAreaProvider.displayName = 'SafeAreaProvider'
