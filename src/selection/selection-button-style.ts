import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import type { ButtonVariant } from '../button/types'

export type SelectionButtonLayout = 'intrinsic' | 'equal'

export function normalizeSelectionButtonColumns(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 5
  return Math.min(24, Math.max(1, Math.floor(value)))
}

export interface SelectionButtonStyleToken {
  height: number
  minWidth: number
  paddingHorizontal: number
  borderWidth: number
  borderRadius: number
  variant: ButtonVariant
  backgroundColor: ColorValue
  filledBackgroundColor: ColorValue
  borderColor: ColorValue
  checkedBackgroundColor: ColorValue
  checkedFilledBackgroundColor: ColorValue
  checkedBorderColor: ColorValue
  labelColor: ColorValue
  checkedLabelColor: ColorValue
  disabledBackgroundColor: ColorValue
  disabledBorderColor: ColorValue
  disabledLabelColor: ColorValue
  pressedOpacity: number
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
  buttonLayout: SelectionButtonLayout = 'intrinsic',
): SelectionButtonResolvedStyles {
  const isBorderless = token.variant === 'filled' || token.variant === 'text'
  const isTransparent =
    token.variant === 'outline' || token.variant === 'dashed' || token.variant === 'text'
  const backgroundColor = state.disabled
    ? isTransparent
      ? 'transparent'
      : token.disabledBackgroundColor
    : state.checked
      ? token.variant === 'filled'
        ? token.checkedFilledBackgroundColor
        : isTransparent
          ? 'transparent'
          : token.checkedBackgroundColor
      : token.variant === 'filled'
        ? token.filledBackgroundColor
        : isTransparent
          ? 'transparent'
          : token.backgroundColor
  const borderColor = state.disabled
    ? token.disabledBorderColor
    : state.checked
      ? token.checkedBorderColor
      : token.borderColor
  const labelColor = state.disabled
    ? token.disabledLabelColor
    : state.checked
      ? token.variant === 'solid'
        ? token.checkedLabelColor
        : token.checkedBorderColor
      : token.labelColor

  return {
    root: {
      alignItems: 'center',
      alignSelf: buttonLayout === 'equal' ? 'stretch' : 'flex-start',
      backgroundColor,
      borderColor,
      borderRadius: token.borderRadius,
      borderStyle: token.variant === 'dashed' ? 'dashed' : 'solid',
      borderWidth: isBorderless ? 0 : token.borderWidth,
      flexDirection: 'row',
      ...(buttonLayout === 'equal'
        ? {
            flexGrow: 0,
            flexShrink: 0,
            width: '100%' as const,
          }
        : {}),
      height: token.height,
      justifyContent: 'center',
      minHeight: token.height,
      minWidth: token.minWidth,
      opacity: state.disabled ? token.disabledOpacity : state.pressed ? token.pressedOpacity : 1,
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
