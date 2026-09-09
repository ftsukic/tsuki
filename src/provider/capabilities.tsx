import type { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider as NativeSafeAreaProvider } from 'react-native-safe-area-context'

const defaultGestureRootStyle = { flex: 1 }
const defaultSafeAreaRootStyle = { flex: 1 }

export interface GestureProviderProps {
  children?: ReactNode
  enabled?: boolean
}

/** Optionally provides the Gesture Handler root required by gesture-enabled content. */
export function GestureProvider({ children, enabled = false }: GestureProviderProps): ReactNode {
  if (!enabled) {
    return children ?? null
  }

  return <GestureHandlerRootView style={defaultGestureRootStyle}>{children}</GestureHandlerRootView>
}

GestureProvider.displayName = 'GestureProvider'

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
