import { forwardRef, useCallback, useMemo } from 'react'
import type { View } from 'react-native'
import { OverlayPortal } from '../overlay/overlay-portal'
import { OVERLAY_TRANSITION_PRESETS } from '../overlay/transition/presets'
import { useDialogState } from './useDialogState'
import { DialogContent, DialogMask } from './dialog-content'
import type { DialogProps } from './types'

export const Dialog = forwardRef<View, DialogProps>(function Dialog(props, ref) {
  const {
    visible,
    defaultVisible = false,
    onVisibleChange,
    afterOpen,
    afterClose,
    closeOnBack = true,
    initialFocusRef,
    returnFocusRef,
    beforeClose,
    onConfirm,
    onCancel,
    overlay = true,
    closeOnPressOverlay = false,
    classNames,
    styles,
  } = props
  const state = useDialogState({
    visible,
    defaultVisible,
    onVisibleChange,
    beforeClose,
    onConfirm,
    onCancel,
  })
  const requestDismiss = state.requestDismiss
  const handleMaskPress = useCallback(() => requestDismiss('overlay'), [requestDismiss])
  const handleBack = useCallback(() => requestDismiss('back'), [requestDismiss])
  const accessibility = useMemo(
    () => ({ mode: 'modal' as const, initialFocusRef, returnFocusRef }),
    [initialFocusRef, returnFocusRef],
  )
  const mask = useMemo(
    () =>
      overlay ? (
        <DialogMask
          classNames={classNames}
          closeOnClick={closeOnPressOverlay}
          closeOnPress={handleMaskPress}
          style={styles?.mask}
        />
      ) : undefined,
    [classNames, closeOnPressOverlay, handleMaskPress, overlay, styles?.mask],
  )

  return (
    <OverlayPortal
      accessibility={accessibility}
      backBehavior={closeOnBack ? 'dismiss' : 'consume'}
      busy={state.busy}
      mask={mask}
      onBack={closeOnBack ? handleBack : undefined}
      onEntered={afterOpen}
      onExited={afterClose}
      transition={OVERLAY_TRANSITION_PRESETS.dialog}
      visible={state.visible}
    >
      <DialogContent
        {...props}
        busy={state.busy}
        onCancelPress={() => state.requestAction('cancel')}
        onConfirmPress={() => state.requestAction('confirm')}
        pendingAction={state.pendingAction}
        ref={ref}
        visible={state.visible}
      />
    </OverlayPortal>
  )
})

Dialog.displayName = 'Dialog'
