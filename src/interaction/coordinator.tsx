import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { InteractionContext } from './context'
import type { InteractionContextValue } from './context'
import { SwipeCellManager } from '../swipe-cell/manager'

export interface InteractionCoordinatorProps {
  children?: ReactNode
  manager?: SwipeCellManager
}

export function InteractionCoordinator({ children, manager }: InteractionCoordinatorProps) {
  const localManager = useRef(new SwipeCellManager()).current
  const coordinator = manager ?? localManager

  const requestOpen = useCallback(
    (id: string, close: () => void) => {
      coordinator.claim({ id, close })
    },
    [coordinator],
  )

  const clear = useCallback(
    (id: string) => {
      coordinator.release(id)
    },
    [coordinator],
  )

  const notifyPress = useCallback(
    (id?: string) => {
      if (id === undefined) coordinator.closeActive()
      else coordinator.closeOthers(id)
    },
    [coordinator],
  )

  const closeCurrent = useCallback(() => {
    coordinator.closeActive()
  }, [coordinator])

  const value = useMemo<InteractionContextValue>(
    () => ({
      requestOpen,
      clear,
      notifyPress,
      closeCurrent,
      closeCurrentSwipeCell: closeCurrent,
    }),
    [clear, closeCurrent, notifyPress, requestOpen],
  )

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>
}

InteractionCoordinator.displayName = 'InteractionCoordinator'
