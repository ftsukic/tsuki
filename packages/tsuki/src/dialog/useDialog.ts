import { useMemo, useRef } from 'react'
import { useOverlayController } from '../overlay/useOverlayController'
import { useStrictUnmountCleanup } from '../overlay/use-strict-mount-cleanup'
import { createBoundDialogController } from './imperative'
import type { DialogController } from './types'

/**
 * Returns an imperative Dialog controller bound to the nearest TsukiProvider and ConfigProvider
 * theme scope without requiring a separate DialogServiceBridge.
 */
export function useDialog(): DialogController {
  const overlayController = useOverlayController()
  const requestsRef = useRef(new Map())
  const nextIdRef = useRef(1)
  const activeRef = useRef(true)

  const controller = useMemo(
    () =>
      createBoundDialogController(
        () => (activeRef.current ? overlayController : null),
        requestsRef.current,
        () => nextIdRef.current++,
        () => activeRef.current,
        'Cannot open a Dialog from an unmounted useDialog() owner.',
      ),
    [overlayController],
  )

  useStrictUnmountCleanup(
    () => {
      activeRef.current = false
      controller.closeAll()
    },
    [controller],
    'effect',
  )

  return controller
}
