import type { SwipeToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createSwipeStyles(token: SwipeToken) {
  return StyleSheet.create({
    root: {
      overflow: 'hidden',
      position: 'relative',
    },
    page: {
      overflow: 'hidden',
    },
    pagination: {
      alignItems: 'center',
      position: 'absolute',
    },
    paginationHorizontal: {
      bottom: token.paginationOffset,
      left: 0,
      right: 0,
    },
    paginationVertical: {
      bottom: 0,
      right: token.paginationOffset,
      top: 0,
    },
    dotsHorizontal: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    dotsVertical: {
      alignItems: 'center',
      flexDirection: 'column',
    },
    dot: {
      backgroundColor: token.dotColor,
      borderRadius: token.dotSize / 2,
      height: token.dotSize,
      marginHorizontal: token.dotGap / 2,
      marginVertical: token.dotGap / 2,
      width: token.dotSize,
    },
    dotActive: {
      backgroundColor: token.dotActiveColor,
    },
  })
}
