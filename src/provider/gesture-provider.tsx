import type { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const defaultGestureRootStyle = { flex: 1 }

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
