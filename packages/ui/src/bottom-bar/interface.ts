import type { BottomBarToken } from '../theme'
import type { ColorValue, ViewProps } from 'react-native'

export interface BottomBarProps extends ViewProps {
  theme?: Partial<BottomBarToken>
  safeAreaInsetBottom?: boolean
  backgroundColor?: ColorValue
  height?: number
  hidden?: boolean
  keyboardShowNotRender?: boolean
  divider?: boolean
}
