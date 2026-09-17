import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import type { CheckboxProps, CheckboxStyleState } from './types'
import type { CheckboxToken } from '../theme'
import {
  getSelectionButtonStyles,
  type SelectionButtonLayout,
} from '../selection/selection-button-style'

export interface CheckboxResolvedStyles {
  root: ViewStyle
  indicator: ViewStyle
  label: TextStyle
  checkColor: ColorValue
  checkSize: number
}

function getIndicatorRadius(token: CheckboxToken, props: CheckboxProps, size: number) {
  return props.shape === 'round' ? size / 2 : token.borderRadius
}

export function getCheckboxStyles(
  token: CheckboxToken,
  props: CheckboxProps,
  state: CheckboxStyleState,
  buttonLayout: SelectionButtonLayout = 'intrinsic',
): CheckboxResolvedStyles {
  const isButton = props.variant === 'button'
  const size = props.iconSize ?? token.size
  const checkedBackground = state.disabled ? token.disabledBackground : token.checkedBackground
  const buttonStyles = isButton
    ? getSelectionButtonStyles(
        {
          height: token.buttonHeight,
          minWidth: token.buttonMinWidth,
          paddingHorizontal: token.buttonPaddingHorizontal,
          borderWidth: token.borderWidth,
          borderRadius: token.buttonBorderRadius,
          variant: props.buttonVariant ?? 'solid',
          backgroundColor: token.buttonBackground,
          filledBackgroundColor: token.buttonFilledBackground,
          borderColor: token.borderColor,
          checkedBackgroundColor: token.checkedBackground,
          checkedFilledBackgroundColor: token.buttonCheckedFilledBackground,
          checkedBorderColor: token.checkedBackground,
          labelColor: token.labelColor,
          checkedLabelColor: token.checkedIconColor,
          disabledBackgroundColor: token.buttonDisabledBackground,
          disabledBorderColor: token.disabledColor,
          disabledLabelColor: token.disabledColor,
          pressedOpacity: token.pressedOpacity,
          disabledOpacity: token.disabledOpacity,
          fontSize: token.fontSize,
          fontFamily: token.fontFamily,
        },
        state,
        buttonLayout,
      )
    : undefined

  return {
    root: buttonStyles?.root ?? {
      alignItems: 'center',
      alignSelf: 'flex-start',
      columnGap: token.gap,
      flexDirection: 'row',
      opacity: state.disabled ? 1 : state.pressed ? token.pressedOpacity : 1,
    },
    indicator: {
      alignItems: 'center',
      backgroundColor: state.disabled
        ? token.disabledBackground
        : state.checked
          ? checkedBackground
          : 'transparent',
      borderColor: state.disabled
        ? token.disabledColor
        : state.checked
          ? token.checkedBackground
          : token.borderColor,
      borderRadius: getIndicatorRadius(token, props, size),
      borderWidth: token.borderWidth,
      height: size,
      justifyContent: 'center',
      width: size,
    },
    label: buttonStyles?.label ?? {
      color: state.disabled ? token.disabledColor : token.labelColor,
      flexShrink: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    checkColor: state.disabled ? token.disabledColor : token.checkedIconColor,
    checkSize: size * 0.72,
  }
}
