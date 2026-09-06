import type { ViewProps, FlexStyle } from 'react-native'

export interface SpaceProps extends ViewProps {
  direction?: 'vertical' | 'horizontal'
  wrap?: boolean
  gap?: number | 's' | 'm' | 'l'
  gapVertical?: number
  gapHorizontal?: number
  head?: boolean | number
  tail?: boolean | number
  justify?: FlexStyle['justifyContent']
  align?: FlexStyle['alignItems']
  minWidth?: number
  shrink?: boolean
}
