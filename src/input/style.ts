import type { ViewStyle } from 'react-native'
import type { InputToken } from '../theme'

export interface InputResolvedStyles {
  passwordToggle: ViewStyle
}

export function getInputStyles(token: InputToken): InputResolvedStyles {
  return {
    passwordToggle: {
      width: token.height,
      height: token.height,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: token.paddingHorizontal,
    },
  }
}
