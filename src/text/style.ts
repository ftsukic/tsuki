import type { TextStyle } from 'react-native'
import type { AliasToken } from '../theme'
import type { TextSize, TextType } from './interface'

export function getTextStyles(
  token: AliasToken,
  type: TextType,
  size: TextSize,
  weight: TextStyle['fontWeight'] | undefined,
): TextStyle {
  const color =
    type === 'secondary'
      ? token.colorTextSecondary
      : type === 'tertiary'
        ? token.colorTextTertiary
        : type === 'disabled'
          ? token.colorTextDisabled
          : token.colorText
  const fontSize =
    size === 'small' ? token.fontSizeSM : size === 'large' ? token.fontSizeLG : token.fontSize
  const lineHeight =
    size === 'small' ? token.lineHeightSM : size === 'large' ? token.lineHeightLG : token.lineHeight

  return {
    color,
    fontFamily: token.fontFamily,
    fontSize,
    lineHeight,
    ...(weight === undefined ? {} : { fontWeight: weight }),
  }
}
