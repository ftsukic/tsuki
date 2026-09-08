import type { ColorValue, TextStyle, ViewStyle } from 'react-native'

export interface SelectionButtonStyleToken {
  height: number
  paddingHorizontal: number
  borderWidth: number
  borderRadius: number
  backgroundColor: ColorValue
  borderColor: ColorValue
  checkedBackgroundColor: ColorValue
  checkedBorderColor: ColorValue
  labelColor: ColorValue
  checkedLabelColor: ColorValue
  disabledBackgroundColor: ColorValue
  disabledBorderColor: ColorValue
  disabledLabelColor: ColorValue
  activeOpacity: number
  disabledOpacity: number
  fontSize: number
  fontFamily: string
}

export interface SelectionButtonStyleState {
  checked: boolean
  disabled: boolean
  pressed: boolean
}

export interface SelectionButtonResolvedStyles {
  root: ViewStyle
  label: TextStyle
}

export function getSelectionButtonStyles(
  token: SelectionButtonStyleToken,
  state: SelectionButtonStyleState,
): SelectionButtonResolvedStyles {
  const backgroundColor = state.disabled
    ? token.disabledBackgroundColor
    : state.checked
      ? token.checkedBackgroundColor
      : token.backgroundColor
  const borderColor = state.disabled
    ? token.disabledBorderColor
    : state.checked
      ? token.checkedBorderColor
      : token.borderColor
  const labelColor = state.disabled
    ? token.disabledLabelColor
    : state.checked
      ? token.checkedLabelColor
      : token.labelColor

  return {
    root: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor,
      borderColor,
      borderRadius: token.borderRadius,
      borderWidth: token.borderWidth,
      flexDirection: 'row',
      height: token.height,
      justifyContent: 'center',
      minHeight: token.height,
      opacity: state.disabled ? token.disabledOpacity : state.pressed ? token.activeOpacity : 1,
      paddingHorizontal: token.paddingHorizontal,
    },
    label: {
      color: labelColor,
      flexShrink: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: Math.max(token.fontSize + 4, token.height - token.borderWidth * 2),
      textAlign: 'center',
    },
  }
}
