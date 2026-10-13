import { useRef, type ReactNode } from 'react'
import { SafeAreaProvider as NativeSafeAreaProvider } from 'react-native-safe-area-context'

const defaultSafeAreaRootStyle = { flex: 1 }

export interface SafeAreaProviderProps {
  children?: ReactNode
  /** 仅在挂载时选择是否提供根节点；变更需显式重新挂载。 */
  enabled?: boolean
}

/** Optionally provides the safe-area context required by inset-aware content. */
export function SafeAreaProvider({ children, enabled = false }: SafeAreaProviderProps): ReactNode {
  const initiallyEnabled = useRef(enabled).current
  if (!initiallyEnabled) {
    return children ?? null
  }

  return (
    <NativeSafeAreaProvider style={defaultSafeAreaRootStyle}>{children}</NativeSafeAreaProvider>
  )
}

SafeAreaProvider.displayName = 'SafeAreaProvider'
