import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { PickerRef, PickerSelection, PickerValue } from '../picker/types'

export interface PickerGroupProps {
  children?: ReactNode
  tabs?: readonly ReactNode[]
  activeTab?: number
  defaultActiveTab?: number
  onChange?: (index: number) => void
  nextStepText?: ReactNode
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  showToolbar?: boolean
  onConfirm?: (results: readonly PickerSelection[]) => void
  onCancel?: () => void
  style?: StyleProp<ViewStyle>
  styles?: PickerGroupStyles
  testID?: string
}

export interface PickerGroupRef {
  confirm(): void
  cancel(): void
  getSelectedValues(): readonly (readonly PickerValue[])[]
}

export type PickerGroupChildRef = PickerRef

export interface PickerGroupSemanticStyles {
  root?: StyleProp<ViewStyle>
  tabs?: StyleProp<ViewStyle>
}

export type PickerGroupStyles = PickerGroupSemanticStyles
