import type { ReactNode } from 'react'
import type { PickerProps } from '../picker/types'
import type { TemporalColumnType } from '../temporal-picker/types'

export type DateTimePickerColumnType = TemporalColumnType

export type DateTimePickerFormatter = (type: DateTimePickerColumnType, value: number) => string

export interface DateTimePickerRef {
  open(): void
  close(): void
  confirm(): void
}

export interface DateTimePickerCoreRef {
  confirm(): void
}

export interface DateTimePickerProps extends Omit<
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
  title?: ReactNode
  cancelText?: ReactNode
  confirmText?: ReactNode
  formatter?: DateTimePickerFormatter
  onChange?(value: Date): void
  onConfirm?(value: Date): void
  onCancel?(): void
  onVisibleChange?(visible: boolean): void
}

export interface DateTimePickerCoreProps extends Omit<
  PickerProps,
  'columns' | 'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel'
> {
  value: Date
  minDate: Date
  maxDate: Date
  formatter?: DateTimePickerFormatter
  onChange?(value: Date): void
  onConfirm?(value: Date): void
  onCancel?(): void
}
