import { useCallback, useContext } from 'react'
import { SwipeCellPressContext, useSwipeCellManager } from './context'

export function useSwipeCellPress() {
  const manager = useSwipeCellManager()
  const owner = useContext(SwipeCellPressContext)
  return useCallback(() => {
    if (owner === null) manager?.closeActive()
    else {
      manager?.closeOthers(owner.id)
      owner.onPressIn?.()
    }
  }, [owner, manager])
}
