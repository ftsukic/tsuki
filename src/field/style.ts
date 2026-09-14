import type { DimensionValue, TextStyle, ViewStyle } from 'react-native'
import type { CellStyles } from '../cell'
import { resolveStyles } from '../style'
import type { AliasToken, FieldToken } from '../theme'
import type { FieldLabelAlign, FieldStatus, FieldStyleState } from './types'

export interface FieldResolvedStyles {
  control: ViewStyle
  feedback: ViewStyle
  description: TextStyle
  error: TextStyle
}

export interface FieldCellStyleOptions {
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  vertical?: boolean
  cellStyles?: CellStyles
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
  state: FieldStyleState,
): FieldResolvedStyles {
  const statusColor = getFieldStatusColor(fieldToken, state.status)

  return {
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

export function createFieldCellStyles(
  fieldToken: FieldToken,
  { labelWidth, labelAlign = 'left', vertical = false, cellStyles }: FieldCellStyleOptions,
): CellStyles {
  return (info) => {
    const custom = resolveStyles(cellStyles, info)
    const effectiveLabelWidth = labelWidth ?? fieldToken.defaultLabelWidth

    return {
      ...custom,
      titleArea: [
        vertical
          ? {
              width: '100%',
              flex: undefined,
              marginRight: undefined,
            }
          : {
              width: effectiveLabelWidth,
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: 'auto',
              marginRight: fieldToken.labelGap,
            },
        custom?.titleArea,
      ],
      title: [{ textAlign: labelAlign }, custom?.title],
      valueArea: [
        vertical
          ? { width: '100%' }
          : {
              flex: 1,
              minWidth: 0,
            },
        custom?.valueArea,
      ],
    }
  }
}
