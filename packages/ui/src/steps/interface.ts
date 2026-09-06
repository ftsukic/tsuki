import type { StepsToken } from '../theme'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export interface StepsItemProps {
  theme?: Partial<StepsToken>
  icon?: ReactNode
  status?: 'wait' | 'finish'
  title?: ReactNode
  index: number
}

export interface StepsProps {
  theme?: Partial<StepsToken>
  current: number
  data?: Omit<StepsItemProps, 'index'>[]
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}
