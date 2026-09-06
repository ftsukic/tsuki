import type { TextInputProps } from '../text-input/interface'

export interface NumberInputProps extends Omit<
  TextInputProps,
  | 'value'
  | 'defaultValue'
  | 'formatTrigger'
  | 'showWordLimit'
  | 'rows'
  | 'type'
  | 'onChange'
  | 'onChangeText'
> {
  type?: 'digit' | 'number'
  value?: number
  defaultValue?: number
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  parser?: (value: string) => number | null
  limitDecimals?: number
  validateTrigger?: 'onChangeText' | 'onEndEditing'
}
