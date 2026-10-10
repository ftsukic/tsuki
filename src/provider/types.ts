import type { ReactNode } from 'react'
import type { ThemeConfig } from '../theme'
import type { MotionConfig } from '../motion/types'

export interface ProviderProps {
  children?: ReactNode
  gesture?: boolean
  safeArea?: boolean
  theme?: ThemeConfig
  motion?: MotionConfig
}
