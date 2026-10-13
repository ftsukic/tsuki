import { useCallback, useContext } from 'react'
import { SwipeCellPressContext, useSwipeCellManager } from './context'

export function useSwipeCellPress(phase: 'pressIn' | 'press' = 'pressIn') {
  const manager = useSwipeCellManager()
  const owner = useContext(SwipeCellPressContext)
  return useCallback(() => {
    if (phase === 'press') {
      owner?.onPress?.()
      return
    }
    if (owner === null) manager?.closeActive()
    else {
      manager?.closeOthers(owner.id)
      owner.onPressIn?.()
    }
  }, [owner, manager, phase])
}
