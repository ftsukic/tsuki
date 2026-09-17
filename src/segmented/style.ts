import type { AliasToken, ButtonToken, SegmentedToken } from '../theme'
import type { TextStyle, ViewStyle } from 'react-native'
import type { SegmentedShape } from './types'

export interface SegmentedResolvedStyles {
  root: ViewStyle
  selectedBackground: ViewStyle
  option: ViewStyle
  label: TextStyle
  pressedOverlay: ViewStyle
}

export function getSegmentedStyles(
  themeToken: AliasToken,
  buttonToken: ButtonToken,
  token: SegmentedToken,
  shape: SegmentedShape,
  block: boolean,
  disabled: boolean,
): SegmentedResolvedStyles {
  const borderRadius = shape === 'round' ? buttonToken.borderRadiusRound : buttonToken.borderRadius

  return {
    root: {
      alignSelf: block ? 'stretch' : 'flex-start',
      backgroundColor: disabled ? themeToken.colorBgContainerDisabled : token.backgroundColor,
      borderColor: token.borderColor,
      borderWidth: token.borderWidth,
      borderRadius,
      flexDirection: 'row',
      overflow: 'hidden',
      padding: token.padding,
      position: 'relative',
    },
    selectedBackground: {
      backgroundColor: disabled
        ? themeToken.colorBgContainerDisabled
        : token.selectedBackgroundColor,
      borderRadius,
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
      borderRadius,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  }
}
