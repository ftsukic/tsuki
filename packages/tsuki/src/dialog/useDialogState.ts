import { useCallback, useRef, useState } from 'react'
import { useStrictUnmountCleanup } from '../overlay/use-strict-mount-cleanup'
import type {
  DialogAction,
  DialogBeforeClose,
  DialogDismissReason,
  DialogProps,
  DialogResult,
} from './types'

interface DialogStateOptions {
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: DialogProps['onVisibleChange']
  onConfirm?: DialogProps['onConfirm']
  onCancel?: DialogProps['onCancel']
  beforeClose?: DialogBeforeClose
  onRequestClose?: (result: DialogResult) => void
  canContinue?: () => boolean
}

interface PendingGuard {
  generation: number
  reason: DialogDismissReason
}

export interface DialogState {
  visible: boolean
  pendingAction: DialogAction | null
  busy: boolean
  requestAction(action: DialogAction): void
  requestDismiss(reason: 'overlay' | 'back'): void
}

function toDialogResult(reason: DialogDismissReason): DialogResult {
  if (reason === 'confirm') return { action: 'confirm' }
  if (reason === 'cancel') return { action: 'cancel' }
  return { action: 'dismiss', reason }
}

export function useDialogState(options: DialogStateOptions): DialogState {
  const {
    visible,
    defaultVisible = false,
    onVisibleChange,
    onConfirm,
    onCancel,
    beforeClose,
    onRequestClose,
    canContinue,
  } = options
  const controlled = visible !== undefined
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible)
  const isVisible = controlled ? visible : uncontrolledVisible
  const visibleRef = useRef(isVisible)
  const controlledRef = useRef(controlled)
  const generationRef = useRef(0)
  const previousStateRef = useRef({ visible: isVisible, controlled })
  const busyRef = useRef<DialogDismissReason | null>(null)
  const [pending, setPending] = useState<PendingGuard | null>(null)
  const mountedRef = useRef(true)
  const onVisibleChangeRef = useRef(onVisibleChange)
  const onConfirmRef = useRef(onConfirm)
  const onCancelRef = useRef(onCancel)
  const beforeCloseRef = useRef(beforeClose)
  const onRequestCloseRef = useRef(onRequestClose)
  const canContinueRef = useRef(canContinue)

  visibleRef.current = isVisible
  controlledRef.current = controlled
  onVisibleChangeRef.current = onVisibleChange
  onConfirmRef.current = onConfirm
  onCancelRef.current = onCancel
  beforeCloseRef.current = beforeClose
  onRequestCloseRef.current = onRequestClose
  canContinueRef.current = canContinue

  if (
    previousStateRef.current.visible !== isVisible ||
    previousStateRef.current.controlled !== controlled
  ) {
    generationRef.current += 1
    busyRef.current = null
    previousStateRef.current = { visible: isVisible, controlled }
  }

  useStrictUnmountCleanup(
    () => {
      mountedRef.current = false
      generationRef.current += 1
      busyRef.current = null
    },
    [],
    'effect',
  )

  const isCurrent = useCallback(
    (generation: number) =>
      mountedRef.current &&
      generationRef.current === generation &&
      visibleRef.current &&
      canContinueRef.current?.() !== false,
    [],
  )

  const commitClose = useCallback((reason: DialogDismissReason) => {
    if (!visibleRef.current) return

    generationRef.current += 1
    busyRef.current = null
    setPending(null)
    if (!controlledRef.current) setUncontrolledVisible(false)
    onVisibleChangeRef.current?.(false)
    onRequestCloseRef.current?.(toDialogResult(reason))
  }, [])

  const runCloseRequest = useCallback(
    (reason: DialogDismissReason) => {
      if (!visibleRef.current || busyRef.current !== null || canContinueRef.current?.() === false) {
        return
      }

      const generation = ++generationRef.current
      if (reason === 'confirm') onConfirmRef.current?.()
      else if (reason === 'cancel') onCancelRef.current?.()
      if (!isCurrent(generation)) return

      const interceptor = beforeCloseRef.current
      if (!interceptor) {
        commitClose(reason)
        return
      }

      let result: boolean | void | Promise<boolean | void>
      try {
        result = interceptor(reason)
      } catch {
        return
      }

      if (result && typeof (result as Promise<boolean | void>).then === 'function') {
        busyRef.current = reason
        setPending({ generation, reason })
        void Promise.resolve(result).then(
          (allowed) => {
            if (!isCurrent(generation)) return
            busyRef.current = null
            setPending(null)
            if (allowed !== false) commitClose(reason)
          },
          () => {
            if (!isCurrent(generation)) return
            busyRef.current = null
            setPending(null)
          },
        )
        return
      }

      if (result !== false && isCurrent(generation)) commitClose(reason)
    },
    [commitClose, isCurrent],
  )

  const requestAction = useCallback(
    (action: DialogAction) => runCloseRequest(action),
    [runCloseRequest],
  )
  const requestDismiss = useCallback(
    (reason: 'overlay' | 'back') => runCloseRequest(reason),
    [runCloseRequest],
  )
  const activePending = pending?.generation === generationRef.current ? pending.reason : null
  const pendingAction: DialogAction | null =
    activePending === 'confirm' || activePending === 'cancel' ? activePending : null

  return {
    visible: isVisible,
    pendingAction,
    busy: activePending !== null,
    requestAction,
    requestDismiss,
  }
}
