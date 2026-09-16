import type { DimensionValue, TextStyle, ViewStyle } from 'react-native'
import type { CellStyles } from '../cell'
import { resolveStyles } from '../style'
import type { AliasToken, FieldToken } from '../theme'
import type { FieldStatus, FieldStyleState, FieldTitleAlign } from './types'

export interface FieldResolvedStyles {
  control: ViewStyle
  feedback: ViewStyle
  description: TextStyle
  error: TextStyle
}

export interface FieldCellStyleOptions {
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  vertical?: boolean
  cellStyles?: CellStyles
}

export function getFieldToken(token: AliasToken): FieldToken {
  return {
    defaultTitleWidth: token.fontSize * 6.2,
    titleGap: token.paddingSM,
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
  { titleWidth, titleAlign = 'left', vertical = false, cellStyles }: FieldCellStyleOptions,
): CellStyles {
  return (info) => {
    const custom = resolveStyles(cellStyles, info)
    const effectiveTitleWidth = titleWidth ?? fieldToken.defaultTitleWidth

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
              width: effectiveTitleWidth,
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: 'auto',
              marginRight: fieldToken.titleGap,
            },
        custom?.titleArea,
      ],
      title: [{ textAlign: titleAlign }, custom?.title],
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
