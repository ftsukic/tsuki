import { useCallback, useMemo, useRef } from 'react'
import { View } from 'react-native'
import { SwipeCellGroupContext } from './context'
import type { SwipeCellGroupProps } from './types'

export function SwipeCellGroup({ children, style, ...viewProps }: SwipeCellGroupProps) {
  const cellsRef = useRef(new Map<string, () => void>())
  const register = useCallback((id: string, close: () => void) => {
    cellsRef.current.set(id, close)
    return () => {
      cellsRef.current.delete(id)
    }
  }, [])
  const requestOpen = useCallback((id: string) => {
    cellsRef.current.forEach((closeCell, cellId) => {
      if (cellId !== id) closeCell()
    })
  }, [])
  const contextValue = useMemo(() => ({ register, requestOpen }), [register, requestOpen])

  return (
    <SwipeCellGroupContext.Provider value={contextValue}>
      <View {...viewProps} style={style}>
        {children}
      </View>
    </SwipeCellGroupContext.Provider>
  )
}

SwipeCellGroup.displayName = 'SwipeCellGroup'
