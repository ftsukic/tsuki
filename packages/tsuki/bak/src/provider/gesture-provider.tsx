import { useRef, type ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const defaultGestureRootStyle = { flex: 1 }

export interface GestureProviderProps {
  children?: ReactNode
  /** 仅在挂载时选择是否提供根节点；变更需显式重新挂载。 */
  enabled?: boolean
}

/** Optionally provides the Gesture Handler root required by gesture-enabled content. */
export function GestureProvider({ children, enabled = false }: GestureProviderProps): ReactNode {
  const initiallyEnabled = useRef(enabled).current
  if (!initiallyEnabled) {
    return children ?? null
  }

  return <GestureHandlerRootView style={defaultGestureRootStyle}>{children}</GestureHandlerRootView>
}

GestureProvider.displayName = 'GestureProvider'
