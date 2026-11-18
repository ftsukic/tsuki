import type { ColorValue, ViewProps, ViewStyle } from 'react-native'

export interface SurfaceProps extends ViewProps {
  background?: ColorValue
  radius?: number
  padding?: number
  gap?: number
  bordered?: boolean
  borderColor?: ColorValue
  borderWidth?: number
  inset?: boolean
  overflow?: ViewStyle['overflow']
  className?: string
}
