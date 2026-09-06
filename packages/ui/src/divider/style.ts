import type { DividerToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createDividerStyles(token: DividerToken) {
  return StyleSheet.create({
    divider: {
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: 0,
    },
    vertical: {
      alignSelf: 'stretch',
      marginHorizontal: token.margin,
      width: token.width,
    },
    line: {
      backgroundColor: token.color,
      height: token.width,
    },
    lineDashed: {
      backgroundColor: 'transparent',
      borderBottomColor: token.color,
      borderBottomWidth: token.width,
      borderStyle: 'dashed',
    },
    content: {
      color: token.color,
      fontSize: token.fontSize,
      marginHorizontal: token.margin,
    },
  })
}
