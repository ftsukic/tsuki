import type { ReactNode } from 'react'
import type { ColorValue, ViewProps } from 'react-native'

export interface SwitchProps<ActiveValue = boolean, InactiveValue = boolean> extends Pick<
  ViewProps,
  'testID'
> {
  value?: ActiveValue | InactiveValue
  defaultValue?: ActiveValue | InactiveValue
  onChange?: (value: ActiveValue | InactiveValue) => void
  beforeChange?: (value: ActiveValue | InactiveValue) => boolean | Promise<boolean>
  activeValue?: ActiveValue
  inactiveValue?: InactiveValue
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  activeChildren?: ReactNode
  inactiveChildren?: ReactNode
  onPress?: () => void
  size?: number
  loading?: boolean
  disabled?: boolean
}
