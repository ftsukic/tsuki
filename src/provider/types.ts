import type { ReactNode } from 'react'
import type { ThemeConfig } from '../theme'
import type { MotionConfig } from '../motion/types'

export interface TsukiProviderProps {
  children?: ReactNode
  /** 初始化时选择手势根节点，挂载后固定。 */
  gesture?: boolean
  /** 初始化时选择安全区根节点，挂载后固定。 */
  safeArea?: boolean
  theme?: ThemeConfig
  motion?: MotionConfig
}

/** @deprecated Use TsukiProviderProps. */
export type ProviderProps = TsukiProviderProps
