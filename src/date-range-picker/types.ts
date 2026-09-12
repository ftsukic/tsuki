import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleResolver } from '../style'
import type { PickerProps, PickerSemanticStyles } from '../picker/types'
import type { DatePickerFormatter } from '../date-picker/types'

export type DateRangePickerValue = readonly [Date, Date]

export type DateRangePickerPart = 'start' | 'end'

export interface DateRangePickerStyleState {
  activePart: DateRangePickerPart
  range: DateRangePickerValue
  visible: boolean
}

export interface DateRangePickerSemanticStyles extends PickerSemanticStyles {
  rangeHeader?: StyleProp<ViewStyle>
  rangeItem?: StyleProp<ViewStyle>
  rangeLabel?: StyleProp<TextStyle>
  rangeValue?: StyleProp<TextStyle>
  rangeValueActive?: StyleProp<TextStyle>
}

export type DateRangePickerStyles = StyleResolver<
  DateRangePickerProps,
  DateRangePickerStyleState,
  DateRangePickerSemanticStyles
>

export interface DateRangePickerRef {
  open(): void
  close(): void
  confirm(): void
}

export interface DateRangePickerProps extends Omit<
  PickerProps,
  | 'columns'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onConfirm'
  | 'onCancel'
  | 'title'
  | 'confirmButtonText'
  | 'cancelButtonText'
  | 'style'
  | 'styles'
> {
  value?: DateRangePickerValue
  defaultValue?: DateRangePickerValue
  minDate?: Date
  maxDate?: Date
  title?: ReactNode
  cancelText?: ReactNode
  confirmText?: ReactNode
  formatter?: DatePickerFormatter
  onChange?(value: DateRangePickerValue): void
  onConfirm?(value: DateRangePickerValue): void
  onCancel?(): void
  onVisibleChange?(visible: boolean): void
  style?: PickerProps['style']
  styles?: DateRangePickerStyles
}
