import type { AliasToken, EmptyToken } from '../theme'
import type { EmptySemanticStyles } from './types'
import type { DimensionValue } from 'react-native'

export function getEmptyStyles(
  themeToken: AliasToken,
  token: EmptyToken,
  imageSize: DimensionValue,
): EmptySemanticStyles {
  return {
    root: {
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingVertical: themeToken.paddingXL,
    },
    image: {
      alignItems: 'center',
      height: imageSize,
      justifyContent: 'center',
      width: imageSize,
    },
    descriptionContainer: {
      marginTop: token.empty_description_margin_top,
      paddingHorizontal: token.empty_description_padding_horizontal,
    },
    description: {
      color: token.empty_description_color,
      fontSize: token.empty_description_font_size,
      lineHeight: token.empty_description_font_size * (themeToken.lineHeight / themeToken.fontSize),
      textAlign: 'center',
    },
    footer: { marginTop: token.empty_footer_margin_top },
  }
}
