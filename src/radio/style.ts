import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import type { RadioProps, RadioStyleState } from './interface'
import type { RadioToken } from '../theme'
import { getSelectionButtonStyles } from '../selection/selection-button-style'

export interface RadioResolvedStyles {
  root: ViewStyle
  indicator: ViewStyle
  dot: ViewStyle
  label: TextStyle
  checkColor: ColorValue
  checkSize: number
}

export function getRadioStyles(
  token: RadioToken,
  props: RadioProps,
  state: RadioStyleState,
): RadioResolvedStyles {
  const labelOnLeft = props.labelPosition === 'left'
  const checkedColor = props.checkedColor ?? token.checkedColor
  const isDotShape = props.shape === 'dot'
  const checkedBackgroundColor = isDotShape ? 'transparent' : checkedColor
  const buttonStyles =
    props.variant === 'button'
      ? getSelectionButtonStyles(
          {
            height: token.buttonHeight,
            paddingHorizontal: token.buttonPaddingHorizontal,
            borderWidth: token.borderWidth,
            borderRadius: token.buttonBorderRadius,
            backgroundColor: token.buttonBackground,
            borderColor: token.borderColor,
            checkedBackgroundColor: checkedColor,
            checkedBorderColor: checkedColor,
            labelColor: token.labelColor,
            checkedLabelColor: token.buttonCheckedLabelColor,
            disabledBackgroundColor: token.buttonDisabledBackground,
            disabledBorderColor: token.disabledBorderColor,
            disabledLabelColor: token.disabledLabelColor,
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
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      opacity: state.disabled || !state.pressed ? 1 : token.activeOpacity,
    },
    indicator: {
      width: token.indicatorSize,
      height: token.indicatorSize,
      borderWidth: token.borderWidth,
      borderColor: state.disabled
        ? token.disabledBorderColor
        : state.checked
          ? checkedColor
          : token.borderColor,
      borderRadius: props.shape === 'square' ? token.borderRadius : token.indicatorSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: state.disabled
        ? token.disabledBackgroundColor
        : state.checked
          ? checkedBackgroundColor
          : 'transparent',
    },
    dot: {
      width: state.checked && isDotShape ? token.dotSize : 0,
      height: state.checked && isDotShape ? token.dotSize : 0,
      borderRadius: token.dotSize / 2,
      backgroundColor: state.disabled ? token.disabledMarkColor : checkedColor,
    },
    label: buttonStyles?.label ?? {
      fontFamily: token.fontFamily,
      marginLeft: labelOnLeft ? 0 : token.gap,
      marginRight: labelOnLeft ? token.gap : 0,
      color: state.disabled ? token.disabledLabelColor : token.labelColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      flexShrink: 1,
    },
    checkColor: state.disabled ? token.disabledMarkColor : '#ffffff',
    checkSize: token.indicatorSize * 0.6,
  }
}
