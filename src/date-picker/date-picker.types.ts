import type { ReactNode } from 'react'
import type { PickerProps } from '../picker/types'
import type { TemporalColumnType } from '../temporal-picker/types'

export type DatePickerType = 'date' | 'year-month' | 'year'

export type DatePickerColumnType = Extract<TemporalColumnType, 'year' | 'month' | 'day'>

export type DatePickerFormatter = (type: DatePickerColumnType, value: number) => string

export interface DatePickerRef {
  open(): void
  close(): void
  confirm(): void
}

export interface DatePickerCoreRef {
  confirm(): void
}

export interface DatePickerProps extends Omit<
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
> {
  value?: Date
  defaultValue?: Date
  minDate?: Date
  maxDate?: Date
  type?: DatePickerType
  title?: ReactNode
  cancelText?: ReactNode
  confirmText?: ReactNode
  formatter?: DatePickerFormatter
  onChange?(value: Date): void
  onConfirm?(value: Date): void
  onCancel?(): void
  onVisibleChange?(visible: boolean): void
}

export interface DatePickerCoreProps extends Omit<
  PickerProps,
  'columns' | 'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel'
> {
  value: Date
  minDate: Date
  maxDate: Date
  type?: DatePickerType
  formatter?: DatePickerFormatter
  onChange?(value: Date): void
  onConfirm?(value: Date): void
  onCancel?(): void
}
