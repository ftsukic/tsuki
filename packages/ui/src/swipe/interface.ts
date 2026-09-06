import type { SwipeToken } from '../theme'
import type { ReactNode } from 'react'
import type { LayoutChangeEvent, ScrollViewProps, StyleProp, ViewStyle } from 'react-native'

type InternalScrollViewProp =
  | 'children'
  | 'contentOffset'
  | 'horizontal'
  | 'onLayout'
  | 'onScrollAnimationEnd'
  | 'pagingEnabled'
  | 'style'

export interface SwipePaginationProps {
  current: number
  count: number
  vertical: boolean
  dotStyle?: StyleProp<ViewStyle>
  dotActiveStyle?: StyleProp<ViewStyle>
}

export interface SwipeProps extends Omit<ScrollViewProps, InternalScrollViewProp> {
  accessibilityLabel?: string
  afterChange?: (index: number) => void
  autoplay?: boolean
  autoplayInterval?: number
  children?: ReactNode
  dotActiveStyle?: StyleProp<ViewStyle>
  dots?: boolean
  dotStyle?: StyleProp<ViewStyle>
  infinite?: boolean
  lazy?: boolean | ((index: number) => boolean)
  onLayout?: (event: LayoutChangeEvent) => void
  onScrollAnimationEnd?: () => void
  pageStyle?: StyleProp<ViewStyle>
  pagination?: (props: SwipePaginationProps) => ReactNode
  renderLazyPlaceholder?: (index: number) => ReactNode
  selectedIndex?: number
  style?: StyleProp<ViewStyle>
  theme?: Partial<SwipeToken>
  vertical?: boolean
}

export interface SwipeRef {
  goTo: (index: number, animated?: boolean) => void
  scrollNextPage: () => void
  scrollToEnd: () => void
  scrollToStart: () => void
}
