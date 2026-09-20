import type { FlexStyle, ViewProps } from 'react-native'

export interface FlexProps extends ViewProps {
  direction?: 'row' | 'column'
  wrap?: boolean
  gap?: number
  align?: FlexStyle['alignItems']
  justify?: FlexStyle['justifyContent']
}
