import type { ViewProps } from 'react-native'

export interface BlankProps extends ViewProps {
  top?: boolean | number
  bottom?: boolean | number
  left?: boolean | number
  right?: boolean | number
  size?: 's' | 'm' | 'l'
  type?: 'margin' | 'padding'
}
