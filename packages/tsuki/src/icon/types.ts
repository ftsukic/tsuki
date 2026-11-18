import type { IconDefinition } from '@ant-design/icons-svg/lib/types'
import type { ColorValue, PressableProps, ViewProps } from 'react-native'
import type { SvgProps } from 'react-native-svg'
import type { IconName } from './icon-definitions'

export type { IconDefinition, IconName }

export interface IconProps extends Omit<ViewProps, 'children'> {
  name: IconName | IconDefinition
  className?: string
  size?: number
  color?: ColorValue
  twoToneColor?: ColorValue | readonly [ColorValue, ColorValue]
  rotation?: number
  svgStyle?: SvgProps['style']
  onPress?: PressableProps['onPress']
  disabled?: boolean
  touchableSize?: number
  hitSlop?: PressableProps['hitSlop']
}
