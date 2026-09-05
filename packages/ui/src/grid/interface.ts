import type { FlexStyle, ViewProps } from 'react-native'

export interface RowProps extends ViewProps {
  gap?: number
  justify?: FlexStyle['justifyContent']
  align?: FlexStyle['alignItems']
}

export interface ColProps extends ViewProps {
  span: number
  offset?: number
}
