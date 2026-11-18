import type { ViewStyle } from 'react-native'
import type { AliasToken } from '../theme'

export function getBottomBarStyles(token: AliasToken, bottomInset = 0): ViewStyle {
  return {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.paddingSM,
    paddingHorizontal: token.padding,
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingSM + Math.max(0, bottomInset),
    backgroundColor: token.colorBgContainer,
    borderTopColor: token.colorBorder,
    borderTopWidth: token.lineWidthHairline,
  }
}
