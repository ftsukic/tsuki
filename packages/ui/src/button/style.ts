import type { AliasToken, ButtonToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createButtonStyles(token: ButtonToken, themeToken: AliasToken) {
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      borderWidth: themeToken.lineWidth,
      borderStyle: 'solid',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    subtext: {
      marginTop: themeToken.lineWidth,
      opacity: token.subtextOpacity,
    },
    disabled: {
      opacity: token.disabledOpacity,
    },
  })
}
