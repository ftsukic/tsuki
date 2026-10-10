import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleResolver } from '../style'

export interface SwipeToOptions {
  immediate?: boolean
  emitChange?: boolean
}

export interface SwipeRef {
  prev: () => void
  next: () => void
  swipeTo: (index: number, options?: SwipeToOptions) => void
}

export interface SwipeStyleState {
  activeIndex: number
  total: number
  vertical: boolean
  dragging: boolean
}

export interface SwipeSemanticStyles {
  root?: StyleProp<ViewStyle>
  track?: StyleProp<ViewStyle>
  item?: StyleProp<ViewStyle>
  indicators?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  activeIndicator?: StyleProp<ViewStyle>
}

export type SwipeStyles = StyleResolver<SwipeProps, SwipeStyleState, SwipeSemanticStyles>

export interface SwipeProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  autoplay?: number
  duration?: number
  initialSwipe?: number
  loop?: boolean
  showIndicators?: boolean
  vertical?: boolean
  touchable?: boolean
  lazyRender?: boolean
  autoHeight?: boolean
  width?: number
  height?: number
  indicatorColor?: string
  onChange?: (index: number) => void
  renderIndicator?: (info: { activeIndex: number; total: number }) => ReactNode
  style?: StyleProp<ViewStyle>
  styles?: SwipeStyles
}

export interface SwipeItemProps extends ViewProps {
  children?: ReactNode
}
