import type { AliasToken, EmptyToken } from '../theme'

export function getEmptyToken(token: AliasToken): EmptyToken {
  return {
    empty_image_size: 160,
    empty_description_margin_top: token.margin,
    empty_description_padding_horizontal: 60,
    empty_description_color: token.colorTextSecondary,
    empty_description_font_size: token.fontSize,
    empty_footer_margin_top: 24,
  }
}
