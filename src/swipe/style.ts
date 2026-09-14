import type { ViewStyle } from 'react-native'
import type { SwipeToken } from '../theme'

export interface SwipeResolvedStyles {
  root: ViewStyle
  track: ViewStyle
  item: ViewStyle
  indicators: ViewStyle
  indicator: ViewStyle
  activeIndicator: ViewStyle
}

export function getSwipeStyles(
  token: SwipeToken,
  vertical: boolean,
  extent: number | undefined,
  autoHeight = false,
): SwipeResolvedStyles {
  const item: ViewStyle = vertical
    ? { width: '100%', height: extent }
    : { width: extent, ...(autoHeight ? {} : { height: '100%' }) }
  return {
    root: { position: 'relative', overflow: 'hidden' },
    track: vertical
      ? { flexDirection: 'column', width: '100%' }
      : { flexDirection: 'row', ...(autoHeight ? {} : { height: '100%' }) },
    item,
    indicators: vertical
      ? {
          position: 'absolute',
          left: token.indicatorMargin,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          gap: token.indicatorGap,
        }
      : {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: token.indicatorMargin,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: token.indicatorGap,
        },
    indicator: {
      width: token.indicatorSize,
      height: token.indicatorSize,
      borderRadius: token.indicatorSize / 2,
      backgroundColor: token.indicatorBackground,
      opacity: token.indicatorInactiveOpacity,
    },
    activeIndicator: {
      width: token.indicatorSize,
      height: token.indicatorSize,
      borderRadius: token.indicatorSize / 2,
      backgroundColor: token.indicatorActiveBackground,
      opacity: token.indicatorActiveOpacity,
    },
  }
}
