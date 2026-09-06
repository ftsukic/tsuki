import type { ToastToken } from '../theme'
import type { ReactNode } from 'react'

export type ToastType = 'text' | 'loading' | 'success' | 'fail' | 'icon'
export interface ToastProps {
  theme?: Partial<ToastToken>
  type?: ToastType
  position?: 'top' | 'bottom' | 'middle'
  message?: string
  overlay?: boolean
  forbidPress?: boolean
  closeOnPress?: boolean
  closeOnPressOverlay?: boolean
  loadingType?: 'circular' | 'spinner'
  duration?: number
  icon?: ReactNode
  onClosed?: () => void
}
export interface ToastMethods {
  close: () => void
  setMessage: (message: string) => void
}
