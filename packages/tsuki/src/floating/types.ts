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
  placement: FloatingPlacement
  offset: number
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
  isRTL?: boolean
}

export interface FloatingPosition {
  x: number
  y: number
  placement: FloatingPlacement
  maxWidth: number
  maxHeight: number
}
