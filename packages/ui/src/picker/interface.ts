import type { PickerViewProps } from '../picker-view'
import type { PopupProps } from '../popup'
import type { ReactNode } from 'react'

export interface PickerProps
  extends Omit<PickerViewProps, 'testID'>, Omit<PopupProps, 'children' | 'position'> {
  title?: ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  toolbarPosition?: 'top' | 'bottom'
  showToolbar?: boolean
  onCancel?: () => void
  onConfirm?: () => void
}
