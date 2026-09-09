import type { ReactNode } from 'react'
import type { ThemeConfig } from '../theme'

export interface ProviderProps {
  children?: ReactNode
  gesture?: boolean
  theme?: ThemeConfig
}
