import { useCallback, useMemo, useRef } from 'react'
import { View } from 'react-native'
import { SwipeCellGroupContext } from './context'
import type { SwipeCellHandle } from './manager'
import type { SwipeCellGroupProps } from './types'

export function SwipeCellGroup({ children, style, ...viewProps }: SwipeCellGroupProps) {
  const activeCellRef = useRef<SwipeCellHandle | null>(null)
  const release = useCallback((handle: SwipeCellHandle) => {
    if (activeCellRef.current === handle) activeCellRef.current = null
  }, [])
  const requestOpen = useCallback((handle: SwipeCellHandle) => {
    const previous = activeCellRef.current
    if (previous === handle) return

    activeCellRef.current = handle
    previous?.close()
  }, [])
  const closeCurrent = useCallback(() => {
    const current = activeCellRef.current
    if (!current) return

    activeCellRef.current = null
    current.close()
  }, [])
  const contextValue = useMemo(
    () => ({ closeCurrent, release, requestOpen }),
    [closeCurrent, release, requestOpen],
  )

  return (
    <SwipeCellGroupContext.Provider value={contextValue}>
      <View {...viewProps} style={style}>
        {children}
      </View>
    </SwipeCellGroupContext.Provider>
  )
}

SwipeCellGroup.displayName = 'SwipeCellGroup'
