import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, FieldToken } from '../theme'
import type { FieldLabelAlign, FieldStatus, FieldStyleState } from './types'

export interface FieldResolvedStyles {
  root: ViewStyle
  label: TextStyle
  labelExtra: TextStyle
  control: ViewStyle
  feedback: ViewStyle
  description: TextStyle
  error: TextStyle
}

export function getFieldToken(token: AliasToken): FieldToken {
  return {
    defaultLabelWidth: token.fontSize * 6.2,
    labelGap: token.paddingSM,
    descriptionGap: token.paddingXS,
    errorGap: token.paddingXS,
    descriptionColor: token.colorTextSecondary,
    errorColor: token.colorError,
    warningColor: token.colorWarning,
  }
}

export function getFieldStatusColor(token: FieldToken, status: FieldStatus): string {
  if (status === 'error') return token.errorColor
  if (status === 'warning') return token.warningColor
  return token.descriptionColor
}

export function getFieldStyles(
  fieldToken: FieldToken,
  token: AliasToken,
  props: Pick<
    {
      labelAlign?: FieldLabelAlign
    },
    'labelAlign'
  >,
  state: FieldStyleState,
): FieldResolvedStyles {
  const labelAlign: FieldLabelAlign = props.labelAlign ?? 'left'
  const statusColor = getFieldStatusColor(fieldToken, state.status)

  return {
    root: {
      width: '100%',
    },
    label: {
      color: token.colorText,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: labelAlign,
      flexShrink: 1,
    },
    labelExtra: {
      color: token.colorText,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      flexShrink: 1,
    },
    control: {
      minWidth: 0,
    },
    feedback: {
      minWidth: 0,
    },
    description: {
      marginTop: fieldToken.descriptionGap,
      color: state.status === 'default' ? fieldToken.descriptionColor : statusColor,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
    error: {
      marginTop: fieldToken.errorGap,
      color: statusColor,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
  }
}
