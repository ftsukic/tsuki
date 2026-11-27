import type { ReactNode } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps } from 'react-native'

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right'

export type FloatingPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export type FloatingPlacementOption = FloatingPlacement | 'auto'

export interface FloatingArrowPosition {
  side: FloatingSide
  x?: number
  y?: number
}

export type FloatingScrollBehavior = 'follow' | 'dismiss'

export interface FloatingScrollProps {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  onScrollEndDrag: () => void
  onMomentumScrollEnd: () => void
  scrollEventThrottle: number
}

export interface FloatingScrollScopeProps {
  children: (scrollProps: FloatingScrollProps) => ReactNode
}

export interface FloatingScrollViewProps extends ScrollViewProps {}

export interface FloatingRect {
  x: number
  y: number
  width: number
  height: number
}

export interface FloatingPadding {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type FloatingCollisionPadding = number | FloatingPadding

export interface FloatingPositionOptions {
  anchor: FloatingRect
  content: Pick<FloatingRect, 'width' | 'height'>
  boundary: FloatingRect
  placement: FloatingPlacementOption
  offset: number
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
  arrowSize?: number
  arrowPadding?: number
  isRTL?: boolean
}

export interface FloatingPosition {
  x: number
  y: number
  placement: FloatingPlacement
  maxWidth: number
  maxHeight: number
  arrow: FloatingArrowPosition
}
