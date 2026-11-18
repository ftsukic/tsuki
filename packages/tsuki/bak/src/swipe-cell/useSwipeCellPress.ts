import { useCallback, useContext } from 'react'
import { SwipeCellPressContext } from './context'

/** Dispatch only to the enclosing cell; page coordination belongs to useSwipeCellDismiss. */
export function useSwipeCellPress() {
  const owner = useContext(SwipeCellPressContext)
  return useCallback(() => owner?.onPress?.() === true, [owner])
}
