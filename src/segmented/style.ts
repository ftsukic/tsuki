import type { AliasToken, SegmentedToken } from '../theme'
import type { TextStyle, ViewStyle } from 'react-native'

export interface SegmentedResolvedStyles {
  root: ViewStyle
  selectedBackground: ViewStyle
  option: ViewStyle
  label: TextStyle
  pressedOverlay: ViewStyle
}

export function getSegmentedStyles(
  themeToken: AliasToken,
  token: SegmentedToken,
  resolvedBorderRadius: number,
  block: boolean,
  disabled: boolean,
): SegmentedResolvedStyles {
  return {
    root: {
      alignSelf: block ? 'stretch' : 'flex-start',
      backgroundColor: disabled ? themeToken.colorBgContainerDisabled : token.backgroundColor,
      borderColor: token.borderColor,
      borderWidth: token.borderWidth,
      borderRadius: resolvedBorderRadius,
      flexDirection: 'row',
      overflow: 'hidden',
      padding: token.padding,
      position: 'relative',
    },
    selectedBackground: {
      backgroundColor: disabled
        ? themeToken.colorBgContainerDisabled
        : token.selectedBackgroundColor,
      borderRadius: resolvedBorderRadius,
      bottom: token.padding,
      left: 0,
      position: 'absolute',
      top: token.padding,
      zIndex: 0,
    },
    option: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1,
    },
    label: {
      color: disabled ? token.disabledColor : themeToken.colorText,
      fontFamily: token.fontFamily,
      textAlign: 'center',
    },
    pressedOverlay: {
      backgroundColor: token.pressedBackgroundColor,
      borderRadius: resolvedBorderRadius,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  }
}
