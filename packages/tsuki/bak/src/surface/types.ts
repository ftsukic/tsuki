import type { ColorValue, ViewProps, ViewStyle } from 'react-native'

export interface SurfaceProps extends ViewProps {
  background?: ColorValue
  radius?: number
  inset?: boolean
  overflow?: ViewStyle['overflow']
}
