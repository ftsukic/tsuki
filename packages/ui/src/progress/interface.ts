import type { ProgressToken } from '../theme'
import type { PropsWithChildren, ReactNode } from 'react'
import type { ColorValue, ViewProps } from 'react-native'

export interface ProgressProps extends Pick<ViewProps, 'testID'> {
  theme?: Partial<ProgressToken>
  percentage?: number
  strokeHeight?: number
  color?: ColorValue
  trackColor?: ColorValue
  pivotText?: string
  pivotColor?: ColorValue
  textColor?: ColorValue
  inactive?: boolean
  showPivot?: boolean
  square?: boolean
  animated?: boolean
  animationDuration?: number
  onAnimationEnd?: (percentage: number) => void
}

export interface CircularProgressProps extends Pick<ViewProps, 'testID'> {
  theme?: Partial<ProgressToken>
  percentage?: number
  size?: number
  strokeWidth?: number
  color?: ColorValue
  trackColor?: ColorValue
  pivotText?: string
  textColor?: ColorValue
  inactive?: boolean
  showPivot?: boolean
  animated?: boolean
  animationDuration?: number
  onAnimationEnd?: (percentage: number) => void
}

export interface ProgressPageProps extends PropsWithChildren {
  theme?: Partial<ProgressToken>
  loading?: boolean
  defaultPercentage?: number
  backgroundColor?: ColorValue
  fail?: boolean
  failMessage?: ReactNode
  failIcon?: ReactNode
  onPressReload?: () => void
  refreshText?: string
  failExtra?: ReactNode
  extraLoading?: ReactNode
  overlayZIndex?: number
  syncRenderChildren?: boolean
}
