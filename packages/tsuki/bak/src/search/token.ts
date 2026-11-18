import type { AliasToken, SearchToken } from '../theme'

export function getSearchToken(token: AliasToken): SearchToken {
  return {
    search_height: token.controlHeight - token.paddingXXS * 2,
    search_background_color: token.colorBgContainer,
    search_content_background_color: token.colorFillTertiary,
    search_icon_color: token.colorTextTertiary,
    search_border_radius: token.borderRadius,
    search_round_border_radius: token.controlHeight / 2,
    search_padding_horizontal: token.paddingSM,
    search_padding_vertical: token.paddingXS,
    search_gap: token.paddingSM,
    search_label_spacing: token.paddingXXS,
    search_icon_size: token.fontSizeLG,
  }
}
