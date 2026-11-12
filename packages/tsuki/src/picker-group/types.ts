import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { PickerOption, PickerValue } from '../picker/types'

export interface PickerGroupSelection {
  values: readonly PickerValue[]
  options: readonly PickerOption[]
  indexes: readonly number[]
}

export interface PickerGroupChildRef {
  confirm(): PickerGroupSelection
  cancel(): void
  getSelectedValues(): readonly PickerValue[]
  getSelectedOptions(): readonly PickerOption[]
}

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
  onConfirm?: (results: readonly PickerGroupSelection[]) => void
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

export interface PickerGroupSemanticStyles {
  root?: StyleProp<ViewStyle>
  tabs?: StyleProp<ViewStyle>
}

export type PickerGroupStyles = PickerGroupSemanticStyles
