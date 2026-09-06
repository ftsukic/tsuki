import type { TextStyle, ViewStyle } from 'react-native'
import type { RadioProps, RadioStyleState } from './interface'
import type { RadioToken } from '../theme'
import type { RadioGroupContextValue } from './context'

export interface RadioResolvedStyles {
  root: ViewStyle
  indicator: ViewStyle
  mark: ViewStyle
  label: TextStyle
}

export function getRadioStyles(
  token: RadioToken,
  props: RadioProps,
  state: RadioStyleState,
  group?: Pick<RadioGroupContextValue, 'block' | 'first' | 'last' | 'previousOptionType'>,
): RadioResolvedStyles {
  const labelOnLeft = props.labelPosition === 'left'
  const checkedColor = props.checkedColor ?? token.checkedColor
  const isButton = props.optionType === 'button'
  const buttonStyle = props.buttonStyle ?? 'outline'
  const buttonHeight =
    props.size === 'small'
      ? token.buttonHeightSmall
      : props.size === 'large'
        ? token.buttonHeightLarge
        : token.buttonHeight
  const buttonChecked = state.checked
  const buttonDisabled = state.disabled
  const buttonSolid = buttonStyle === 'solid'
  const isDot = props.shape === 'dot'
  const connectedButton = isButton && group ? group : undefined

  return {
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: group?.block ? 'auto' : 'flex-start',
      justifyContent: 'center',
      position: isButton ? 'relative' : undefined,
      zIndex: isButton && state.checked ? 1 : undefined,
      minHeight: isButton ? buttonHeight : undefined,
      paddingHorizontal: isButton ? token.buttonPaddingHorizontal : undefined,
      borderWidth: isButton ? token.borderWidth : undefined,
      borderColor: isButton
        ? buttonDisabled
          ? buttonChecked
            ? token.buttonCheckedBgDisabled
            : token.disabledColor
          : buttonChecked
            ? checkedColor
            : token.borderColor
        : undefined,
      borderRadius: isButton ? token.buttonBorderRadius : undefined,
      backgroundColor: isButton
        ? buttonDisabled
          ? buttonChecked
            ? token.buttonCheckedBgDisabled
            : token.buttonBg
          : buttonSolid && buttonChecked
            ? state.pressed
              ? token.buttonSolidCheckedActiveBg
              : token.buttonSolidCheckedBg
            : buttonChecked
              ? token.buttonCheckedBg
              : token.buttonBg
        : undefined,
      opacity: state.disabled
        ? token.disabledOpacity
        : isButton
          ? 1
          : state.pressed
            ? token.activeOpacity
            : 1,
      ...(connectedButton && !connectedButton.first
        ? {
            borderTopStartRadius: 0,
            borderBottomStartRadius: 0,
            marginStart: -token.borderWidth,
          }
        : {}),
      ...(connectedButton && !connectedButton.last
        ? {
            borderTopEndRadius: 0,
            borderBottomEndRadius: 0,
          }
        : {}),
      ...(connectedButton?.block ? { flex: 1, minWidth: 0 } : {}),
    },
    indicator: {
      width: token.indicatorSize,
      height: token.indicatorSize,
      borderWidth: token.borderWidth,
      borderColor: state.disabled
        ? token.disabledColor
        : state.checked
          ? checkedColor
          : token.borderColor,
      borderRadius: props.shape === 'square' ? token.borderRadius : token.indicatorSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDot
        ? 'transparent'
        : state.disabled
          ? token.disabledBackground
          : state.checked
            ? checkedColor
            : 'transparent',
    },
    mark: {
      width: isDot ? token.dotSize : state.checked ? token.dotSize * 0.75 : 0,
      height: isDot ? token.dotSize : state.checked ? token.dotSize * 0.45 : 0,
      borderRadius: isDot ? token.dotSize / 2 : 0,
      borderLeftWidth: isDot || !state.checked ? 0 : token.borderWidth,
      borderBottomWidth: isDot || !state.checked ? 0 : token.borderWidth,
      borderColor: state.disabled ? token.disabledColor : token.checkmarkColor,
      backgroundColor:
        isDot && state.checked
          ? state.disabled
            ? token.disabledColor
            : checkedColor
          : 'transparent',
      transform: isDot || !state.checked ? undefined : [{ rotate: '-45deg' }],
    },
    label: {
      marginLeft: isButton ? 0 : labelOnLeft ? 0 : token.gap,
      marginRight: isButton ? 0 : labelOnLeft ? token.gap : 0,
      color: state.disabled
        ? isButton && buttonChecked
          ? token.buttonCheckedColorDisabled
          : token.disabledLabelColor
        : isButton
          ? buttonSolid && buttonChecked
            ? token.buttonSolidCheckedColor
            : buttonChecked
              ? checkedColor
              : token.buttonColor
          : token.labelColor,
      fontSize: isButton && props.size === 'large' ? token.fontSize + 2 : token.fontSize,
      lineHeight: isButton ? buttonHeight - token.borderWidth * 2 : token.lineHeight,
      flexShrink: 1,
    },
  }
}
