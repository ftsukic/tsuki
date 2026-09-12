import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken } from '../theme'

export interface DateRangePickerResolvedStyles {
  root: ViewStyle
  header: ViewStyle
  item: ViewStyle
  label: TextStyle
  value: TextStyle
  valueActive: TextStyle
}

export function getDateRangePickerStyles(token: AliasToken): DateRangePickerResolvedStyles {
  return {
    root: {
      backgroundColor: token.colorBgContainer,
    },
    header: {
      flexDirection: 'row',
      paddingVertical: token.paddingSM,
    },
    item: {
      flex: 1,
    },
    label: {
      color: token.colorTextSecondary,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      textAlign: 'center',
    },
    value: {
      color: token.colorTextSecondary,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeight,
      marginTop: token.paddingXS,
      textAlign: 'center',
    },
    valueActive: {
      color: token.colorPrimary,
      fontWeight: '600',
    },
  }
}
