import type { AliasToken, FieldToken } from '../theme'
import type { TextStyle, ViewStyle } from 'react-native'
import type { FieldLabelAlign, FieldProps, FieldStatus, FieldStyleState } from './interface'

export interface FieldResolvedStyles {
  root: ViewStyle
  row: ViewStyle
  labelContainer: ViewStyle
  customLabel: ViewStyle
  label: TextStyle
  required: TextStyle
  content: ViewStyle
  description: TextStyle
  error: TextStyle
}

export function getFieldToken(token: AliasToken): FieldToken {
  return {
    labelColor: token.colorText,
    errorColor: token.colorError,
    warningColor: token.colorWarning,
    padding: token.padding,
    height: token.controlHeight,
  }
}

export function getFieldStatusColor(token: FieldToken, status: FieldStatus): string {
  if (status === 'error') return token.errorColor
  if (status === 'warning') return token.warningColor
  return token.labelColor
}

export function getFieldStyles(
  fieldToken: FieldToken,
  token: AliasToken,
  props: Pick<FieldProps, 'labelAlign' | 'labelWidth'>,
  state: FieldStyleState,
): FieldResolvedStyles {
  const labelAlign: FieldLabelAlign = props.labelAlign ?? 'left'
  const statusColor = getFieldStatusColor(fieldToken, state.status)

  return {
    root: {
      width: '100%',
      minHeight: fieldToken.height,
      paddingHorizontal: fieldToken.padding,
      paddingVertical: token.paddingXS,
    },
    row: {
      minHeight: fieldToken.height,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    labelContainer: {
      width: props.labelWidth,
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    customLabel: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexShrink: 1,
    },
    label: {
      flex: 1,
      flexShrink: 1,
      color: statusColor,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: labelAlign,
    },
    required: {
      color: fieldToken.errorColor,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginRight: token.paddingXXS,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    description: {
      marginTop: token.paddingXS,
      color: state.status === 'default' ? fieldToken.labelColor : statusColor,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
    error: {
      marginTop: token.paddingXS,
      color: statusColor,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
  }
}
