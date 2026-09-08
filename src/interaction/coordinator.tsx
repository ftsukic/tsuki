import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { InteractionContext } from './context'
import type { ActiveSwipeCell, InteractionContextValue } from './context'

export interface InteractionCoordinatorProps {
  children?: ReactNode
}

export function InteractionCoordinator({ children }: InteractionCoordinatorProps) {
  const activeRef = useRef<ActiveSwipeCell | null>(null)

  const requestOpen = useCallback((id: string, close: () => void) => {
    const current = activeRef.current
    if (current && current.id !== id) {
      current.close()
    }

    activeRef.current = { id, close }
  }, [])

  const clear = useCallback((id: string) => {
    if (activeRef.current?.id === id) {
      activeRef.current = null
    }
  }, [])

  const notifyPress = useCallback((id?: string) => {
    const current = activeRef.current
    if (current && current.id !== id) {
      current.close()
    }
  }, [])

  const closeCurrent = useCallback(() => {
    activeRef.current?.close()
  }, [])

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
