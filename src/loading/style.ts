import type { TextStyle, ViewStyle } from 'react-native'
import type { LoadingProps, LoadingStyleState } from './interface'
import type { LoadingToken } from '../theme'

export interface LoadingResolvedStyles {
  root: ViewStyle
  indicator: ViewStyle
  text: TextStyle
}

export function getLoadingStyles(
  token: LoadingToken,
  props: LoadingProps,
  state: LoadingStyleState,
): LoadingResolvedStyles {
  const size = props.size ?? token.defaultSize
  const textSize = props.textSize ?? token.textFontSize

  return {
    root: {
      alignItems: 'center',
      flexDirection: state.vertical ? 'column' : 'row',
      justifyContent: 'center',
    },
    indicator: {
      alignItems: 'center',
      height: size,
      justifyContent: 'center',
      width: size,
    },
    text: {
      color: props.textColor ?? token.textColor,
      fontSize: textSize,
      lineHeight: textSize + 6,
      marginLeft: state.vertical ? 0 : token.textGap,
      marginTop: state.vertical ? token.textGap : 0,
    },
  }
}
