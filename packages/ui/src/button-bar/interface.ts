import type { BlankProps } from '../blank/interface'
import type { BottomBarProps } from '../bottom-bar/interface'
import type { ButtonProps } from '../button/interface'
import type { ButtonBarToken } from '../theme'

export interface ButtonBarProps extends Omit<BottomBarProps, 'theme'> {
  theme?: Partial<ButtonBarToken>
  alone?: boolean
  buttons?: (Omit<ButtonProps, 'onPress' | 'text'> & {
    text: string
    hidden?: boolean
    onPress?: () => void
  })[]
  count?: number
  moreText?: string
  blankSize?: BlankProps['size']
}
export interface ButtonBarConfirmProps extends Omit<
  ButtonBarProps,
  'alone' | 'buttons' | 'count' | 'moreText'
> {
  cancel?: React.ReactNode
}
