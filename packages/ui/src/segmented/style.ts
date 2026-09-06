import type { SegmentedToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createSegmentedStyles(token: SegmentedToken) {
  return StyleSheet.create({
    track: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: token.trackBg,
      borderRadius: token.borderRadius,
      flexDirection: 'row',
      overflow: 'hidden',
      position: 'relative',
    },
    blockTrack: {
      alignSelf: 'stretch',
    },
    thumb: {
      bottom: token.trackPadding,
      left: 0,
      position: 'absolute',
      top: token.trackPadding,
      zIndex: 0,
    },
    item: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: token.itemMinWidth,
      zIndex: 1,
    },
  })
}
