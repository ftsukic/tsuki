import type { TextStyle, ViewStyle } from 'react-native'
import type { ProgressProps, ProgressStyleState } from './interface'
import type { ProgressToken } from '../theme'

export interface ProgressResolvedStyles {
  root: ViewStyle
  track: ViewStyle
  portion: ViewStyle
  pivot: ViewStyle
  circle: ViewStyle
  circleLabel: TextStyle
}

export function getProgressStyles(
  token: ProgressToken,
  props: ProgressProps,
  state: ProgressStyleState,
): ProgressResolvedStyles {
  const lineHeight = props.strokeWidth ?? token.progress_height
  const radius = props.strokeLinecap === 'round' ? lineHeight / 2 : 0
  const pivotHeight = Math.max(lineHeight, token.progress_pivot_font_size + 8)

  return {
    root: {
      alignItems: state.type === 'circle' ? 'center' : undefined,
      width: '100%',
    },
    track: {
      backgroundColor: props.trackColor ?? token.progress_track_color,
      borderRadius: radius,
      height: lineHeight,
      overflow: 'visible',
      position: 'relative',
      width: '100%',
    },
    portion: {
      backgroundColor: props.color ?? token.progress_color,
      borderRadius: radius,
      height: '100%',
    },
    pivot: {
      alignItems: 'center',
      backgroundColor: props.pivotColor ?? token.progress_pivot_color,
      borderRadius: pivotHeight / 2,
      justifyContent: 'center',
      minHeight: pivotHeight,
      paddingHorizontal: 4,
      position: 'absolute',
      top: (lineHeight - pivotHeight) / 2,
    },
    circle: {
      alignItems: 'center',
      height: props.size ?? token.progress_circle_size,
      justifyContent: 'center',
      width: props.size ?? token.progress_circle_size,
    },
    circleLabel: {
      color: props.color ?? token.progress_color,
      fontSize: token.progress_pivot_font_size,
      position: 'absolute',
      textAlign: 'center',
    },
  }
}
