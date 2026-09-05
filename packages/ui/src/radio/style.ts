import type { TextStyle, ViewStyle } from 'react-native'
import type { RadioProps, RadioStyleState } from './interface'
import type { RadioToken } from '../theme'

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
): RadioResolvedStyles {
  const labelOnLeft = props.labelPosition === 'left'
  const checkedColor = props.checkedColor ?? token.checkedColor

  return {
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      opacity: state.disabled ? token.disabledOpacity : state.pressed ? token.activeOpacity : 1,
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
      backgroundColor:
        state.checked && props.shape === 'square'
          ? state.disabled
            ? token.disabledColor
            : checkedColor
          : 'transparent',
    },
    mark: {
      width: state.checked ? token.dotSize : 0,
      height: state.checked ? token.dotSize : 0,
      borderRadius: props.shape === 'square' ? token.borderRadius / 2 : token.dotSize / 2,
      backgroundColor: state.disabled ? token.disabledColor : checkedColor,
    },
    label: {
      marginLeft: labelOnLeft ? 0 : token.gap,
      marginRight: labelOnLeft ? token.gap : 0,
      color: state.disabled ? token.disabledLabelColor : token.labelColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      flexShrink: 1,
    },
  }
}
