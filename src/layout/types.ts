import type { FlexStyle, StyleProp, ViewProps, ViewStyle } from 'react-native'

import type { StyleResolver } from '../style'

export interface ColSemanticStyles {
  content?: StyleProp<ViewStyle>
}

export type ColStyles = StyleResolver<ColProps, Record<string, never>, ColSemanticStyles>

export interface RowProps extends ViewProps {
  gutter?: number | [number, number]
  wrap?: boolean
  justify?: FlexStyle['justifyContent']
  align?: FlexStyle['alignItems']
}

export interface ColProps extends ViewProps {
  span?: number
  offset?: number
  styles?: ColStyles
}
