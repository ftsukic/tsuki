import type { SegmentedToken } from '../theme'
import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'

export type SegmentedValue = string | number
export type SegmentedSize = 'small' | 'medium' | 'large'

export interface SegmentedOption<T extends SegmentedValue = SegmentedValue> {
  label: ReactNode
  value: T
  disabled?: boolean
  accessibilityLabel?: string
}

export type SegmentedOptionInput<T extends SegmentedValue = SegmentedValue> = T | SegmentedOption<T>

export interface SegmentedProps<T extends SegmentedValue = SegmentedValue> extends Pick<
  ViewProps,
  'accessibilityLabel'
> {
  value?: T
  defaultValue?: T
  options: readonly SegmentedOptionInput<T>[]
  disabled?: boolean
  block?: boolean
  size?: SegmentedSize
  onChange?: (value: T) => void
  theme?: Partial<SegmentedToken>
  style?: StyleProp<ViewStyle>
  testID?: string
}
