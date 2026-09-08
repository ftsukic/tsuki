import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import type { CheckboxProps, CheckboxStyleState } from './interface'
import type { CheckboxToken } from '../theme'
import { getSelectionButtonStyles } from '../selection/selection-button-style'

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
): CheckboxResolvedStyles {
  const isButton = props.variant === 'button'
  const size = props.iconSize ?? token.size
  const labelOnLeft = props.labelPosition === 'left'
  const checkedBackground = state.disabled ? token.disabledBackground : token.checkedBackground
  const labelColor = state.disabled
    ? token.disabledColor
    : isButton && state.checked
      ? token.checkedIconColor
      : token.labelColor
  const buttonStyles = isButton
    ? getSelectionButtonStyles(
        {
          height: token.buttonHeight,
          paddingHorizontal: token.buttonPaddingHorizontal,
          borderWidth: token.borderWidth,
          borderRadius: token.buttonBorderRadius,
          backgroundColor: token.buttonBackground,
          borderColor: token.borderColor,
          checkedBackgroundColor: token.checkedBackground,
          checkedBorderColor: token.checkedBackground,
          labelColor: token.labelColor,
          checkedLabelColor: token.checkedIconColor,
          disabledBackgroundColor: token.buttonDisabledBackground,
          disabledBorderColor: token.disabledColor,
          disabledLabelColor: token.disabledColor,
          activeOpacity: token.activeOpacity,
          disabledOpacity: token.disabledOpacity,
          fontSize: token.fontSize,
          fontFamily: token.fontFamily,
        },
        state,
      )
    : undefined

  return {
    root: buttonStyles?.root ?? {
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      opacity: state.disabled ? 1 : state.pressed ? token.activeOpacity : 1,
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
    label: {
      color: labelColor,
      flexShrink: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: isButton
        ? Math.max(token.fontSize + 4, token.buttonHeight - token.borderWidth * 2)
        : token.lineHeight,
      marginLeft: isButton ? 0 : labelOnLeft ? 0 : token.gap,
      marginRight: isButton ? 0 : labelOnLeft ? token.gap : 0,
      ...(isButton ? { textAlign: 'center' as const } : {}),
    },
    checkColor: state.disabled ? token.disabledColor : token.checkedIconColor,
    checkSize: size * 0.72,
  }
}
