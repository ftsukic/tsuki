import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'

export interface EmptyProps extends Omit<ViewProps, 'children' | 'style'> {
  image?: ReactNode | string
  imageSize?: number | string
  description?: ReactNode
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}
