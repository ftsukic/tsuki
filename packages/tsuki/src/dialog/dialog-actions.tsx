import type { ReactNode } from 'react'
import { createElement } from 'react'
import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { Button } from '../button'
import { cn } from '../style/cn'
import { semanticClassName } from '../style/semantic'
import type { DialogAction, DialogClassNames, DialogStyles, DialogTheme } from './types'

interface DialogActionsProps {
  theme: DialogTheme
  styles: DialogStyles | undefined
  classNames: DialogClassNames | undefined
  showConfirmButton: boolean
  showCancelButton: boolean
  confirmButtonText: ReactNode
  cancelButtonText: ReactNode
  confirmButtonDisabled: boolean
  cancelButtonDisabled: boolean
  pendingAction: DialogAction | null
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DialogActions({
  theme,
  styles,
  classNames,
  showConfirmButton,
  showCancelButton,
  confirmButtonText,
  cancelButtonText,
  confirmButtonDisabled,
  cancelButtonDisabled,
  pendingAction,
  busy,
  onConfirm,
  onCancel,
}: DialogActionsProps) {
  const roundButtons = theme === 'round-button'
  const hasBothButtons = showConfirmButton && showCancelButton

  if (!showConfirmButton && !showCancelButton) return null

  return createElement(
    View,
    {
      className: semanticClassName(
        classNames,
        'footer',
        roundButtons
          ? 'flex-row gap-2 min-h-tsuki-dialog-button px-tsuki-dialog-content pb-tsuki-dialog-content'
          : 'flex-row min-h-tsuki-dialog-button border-t border-tsuki-border',
      ),
      style: styles?.footer,
      testID: 'dialog-footer',
    } as ViewProps,
    showCancelButton ? (
      <Button
        className={cn(
          'flex-1 min-w-0 h-tsuki-dialog-button',
          roundButtons ? 'rounded-full' : 'rounded-none',
          hasBothButtons && !roundButtons ? 'border-r border-tsuki-border' : undefined,
          classNames?.cancelButton,
        )}
        disabled={cancelButtonDisabled || busy}
        loading={pendingAction === 'cancel'}
        onPress={onCancel}
        size="medium"
        style={styles?.cancelButton}
        testID="dialog-cancel-button"
        variant={roundButtons ? 'outlined' : 'ghost'}
      >
        {cancelButtonText}
      </Button>
    ) : null,
    showConfirmButton ? (
      <Button
        className={cn(
          'flex-1 min-w-0 h-tsuki-dialog-button',
          roundButtons ? 'rounded-full' : 'rounded-none',
          classNames?.confirmButton,
        )}
        disabled={confirmButtonDisabled || busy}
        loading={pendingAction === 'confirm'}
        onPress={onConfirm}
        size="medium"
        style={styles?.confirmButton}
        testID="dialog-confirm-button"
        variant={roundButtons ? 'solid' : 'ghost'}
      >
        {confirmButtonText}
      </Button>
    ) : null,
  )
}
