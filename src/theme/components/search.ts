import type { AliasToken, SearchToken } from '../interface'

export function getSearchToken(token: AliasToken): SearchToken {
  return {
    search_height_small: token.controlHeightSM,
    search_height_medium: token.controlHeight - token.paddingXXS,
    search_height_large: token.controlHeightLG,
    search_background_color: token.colorFillTertiary,
    search_text_color: token.colorText,
    search_placeholder_color: token.colorTextPlaceholder,
    search_icon_color: token.colorTextTertiary,
    search_clear_color: token.colorTextTertiary,
    search_border_radius: token.controlHeight,
    search_padding_horizontal: token.paddingSM,
    search_prefix_spacing: token.paddingXXS,
    search_suffix_spacing: token.paddingXXS,
    search_icon_size: token.fontSizeLG,
    search_clear_size: token.fontSizeLG,
    search_font_size: token.fontSize,
    search_line_height: token.lineHeight,
    search_font_family: token.fontFamily,
    search_disabled_background_color: token.colorBgContainerDisabled,
    search_disabled_text_color: token.colorTextDisabled,
    search_disabled_opacity: 0.6,
    search_pressed_opacity: 0.6,
  }
}
