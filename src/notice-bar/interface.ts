import type { ReactNode } from 'react'

export interface NoticeBarProps {
  text?: string
  children?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  visible?: boolean
  disabled?: boolean
  scrollable?: boolean
  wrapable?: boolean
  speed?: number
  delay?: number
  onClick?: () => void
  onClose?: () => void
}
