import type { FlexStyle, ViewProps } from 'react-native'

export interface SpaceProps extends ViewProps {
  direction?: 'horizontal' | 'vertical'
  gap?: number
  wrap?: boolean
  align?: FlexStyle['alignItems']
}
