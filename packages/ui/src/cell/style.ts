import type { AliasToken, CellToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createCellStyles(token: CellToken, themeToken: AliasToken) {
  return StyleSheet.create({
    cell: {
      backgroundColor: token.backgroundColor,
    },
    inner: {
      marginHorizontal: token.paddingHorizontal,
      paddingVertical: token.paddingVertical,
      minHeight: token.minHeight,
    },
    innerRow: {
      flexDirection: 'row',
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      marginRight: token.iconGap,
    },
    titleExtra: {
      marginRight: token.iconGap,
    },
    titleText: {
      color: token.titleColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    value: {
      flex: 1,
      justifyContent: 'center',
    },
    valueText: {
      color: token.valueColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    extraText: {
      color: token.extraColor,
      fontSize: token.extraFontSize,
      lineHeight: token.extraLineHeight,
      marginHorizontal: token.paddingHorizontal,
      paddingBottom: token.paddingVertical,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    required: {
      width: token.requiredWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    requiredText: {
      color: token.requiredColor,
      fontSize: token.fontSize,
    },
    arrow: {
      alignSelf: 'center',
      marginLeft: token.iconGap,
    },
    divider: {
      height: themeToken.lineWidth,
      backgroundColor: token.borderColor,
    },
    groupTitle: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: token.paddingHorizontal,
      paddingVertical: token.paddingVertical,
    },
    groupTitleText: {
      color: token.groupTitleColor,
      fontSize: token.groupTitleFontSize,
      lineHeight: token.lineHeight,
    },
  })
}
