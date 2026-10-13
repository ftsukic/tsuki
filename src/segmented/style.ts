import type { AliasToken, SegmentedToken } from '../theme'
import type { TextStyle, ViewStyle } from 'react-native'

export interface SegmentedResolvedStyles {
  root: ViewStyle
  selectedBackground: ViewStyle
  option: ViewStyle
  optionPressed: ViewStyle
  label: TextStyle
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
      width: block ? '100%' : undefined,
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
    optionPressed: {
      borderRadius: resolvedBorderRadius,
    },
    label: {
      color: disabled ? token.disabledColor : themeToken.colorText,
      fontFamily: token.fontFamily,
      textAlign: 'center',
    },
  }
}
