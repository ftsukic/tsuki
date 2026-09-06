import type { TagToken } from '../theme'
import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native'

export type TagSize = 'l' | 'm' | 's'
export type TagType = 'primary' | 'hazy' | 'ghost'

export interface TagProps extends ViewProps {
  theme?: Partial<TagToken>
  innerStyle?: StyleProp<ViewStyle>
  closable?: boolean
  onClose?: () => void
  size?: TagSize
  type?: TagType
  visible?: boolean
  color?: ColorValue
  textColor?: ColorValue
  closeIcon?: React.ReactNode
  icon?: React.ReactNode
  hairline?: boolean
}
