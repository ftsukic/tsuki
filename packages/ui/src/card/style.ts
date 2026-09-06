import type { AliasToken, CardToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createCardStyles(token: CardToken, themeToken: AliasToken) {
  return StyleSheet.create({
    card: {
      backgroundColor: token.backgroundColor,
      borderRadius: token.borderRadius,
      overflow: 'hidden',
      boxShadow: token.shadow,
    },
    cardSmall: {
      borderRadius: Math.max(
        themeToken.borderRadiusXS,
        token.borderRadius - themeToken.borderRadiusXS,
      ),
    },
    headerSmall: { minHeight: token.headerMinHeightSM },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: token.headerMinHeight,
      paddingHorizontal: token.padding,
    },
    title: { alignItems: 'center', flex: 1, flexDirection: 'row' },
    titleText: {
      color: token.titleColor,
      flex: 1,
      fontSize: token.titleFontSize,
      fontWeight: '600',
    },
    body: { padding: token.padding },
    footer: { padding: token.padding },
    footerText: { color: token.footerColor, fontSize: token.footerFontSize },
  })
}
