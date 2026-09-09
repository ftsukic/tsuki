import type { AliasToken, PickerToken } from '../theme'

export function getPickerToken(token: AliasToken): PickerToken {
  return {
    picker_toolbar_height: 44,
    picker_item_height: 44,
    picker_visible_item_count: 5,
    picker_item_font_size: token.fontSizeLG,
    picker_item_line_height: token.lineHeightLG,
    picker_text_color: token.colorTextSecondary,
    picker_active_text_color: token.colorText,
    picker_indicator_color: token.colorBorderSecondary,
    picker_mask_color: token.colorBgContainer,
    picker_background_color: token.colorBgContainer,
    picker_toolbar_button_font_size: token.fontSize,
    picker_toolbar_button_line_height: token.lineHeight,
    picker_toolbar_padding_horizontal: token.padding,
    picker_border_width: token.lineWidth,
    picker_item_padding_horizontal: token.paddingSM,
    picker_item_inactive_opacity: 0.3,
    picker_item_inactive_scale: 0.9,
    picker_item_translate_y: 4,
    picker_mask_opacities: [0.76, 0.56, 0.34, 0.16],
    picker_font_family: token.fontFamily,
  }
}
