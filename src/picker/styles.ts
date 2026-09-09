import type { TextStyle, ViewStyle } from 'react-native'
import type { PickerToken } from '../theme'

export interface PickerResolvedStyles {
  root: ViewStyle
  container: ViewStyle
  toolbar: ViewStyle
  toolbarButton: ViewStyle
  toolbarButtonLabel: TextStyle
  view: ViewStyle
  columns: ViewStyle
  column: ViewStyle
  item: ViewStyle
  itemLabel: TextStyle
  mask: ViewStyle
  indicator: ViewStyle
}

export function getPickerStyles(
  token: PickerToken,
  itemHeight: number,
  visibleItemCount: number,
): PickerResolvedStyles {
  const viewHeight = itemHeight * visibleItemCount
  const indicatorTop = ((visibleItemCount - 1) * itemHeight) / 2

  return {
    root: {
      backgroundColor: token.picker_background_color,
    },
    container: {
      backgroundColor: token.picker_background_color,
    },
    toolbar: {
      height: token.picker_toolbar_height,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: token.picker_indicator_color,
      borderBottomWidth: token.picker_border_width,
    },
    toolbarButton: {
      minWidth: token.picker_toolbar_height,
      height: token.picker_toolbar_height,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.picker_toolbar_padding_horizontal,
    },
    toolbarButtonLabel: {
      color: token.picker_active_text_color,
      fontFamily: token.picker_font_family,
      fontSize: token.picker_toolbar_button_font_size,
      lineHeight: token.picker_toolbar_button_line_height,
    },
    view: {
      height: viewHeight,
      backgroundColor: token.picker_background_color,
      overflow: 'hidden',
    },
    columns: {
      flex: 1,
      flexDirection: 'row',
    },
    column: {
      flex: 1,
      minWidth: 0,
    },
    item: {
      height: itemHeight,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.picker_item_padding_horizontal,
    },
    itemLabel: {
      color: token.picker_text_color,
      fontFamily: token.picker_font_family,
      fontSize: token.picker_item_font_size,
      lineHeight: token.picker_item_line_height,
      textAlign: 'center',
    },
    mask: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    indicator: {
      position: 'absolute',
      top: indicatorTop,
      right: 0,
      left: 0,
      height: itemHeight,
      zIndex: 2,
      borderTopColor: token.picker_indicator_color,
      borderTopWidth: token.picker_border_width,
      borderBottomColor: token.picker_indicator_color,
      borderBottomWidth: token.picker_border_width,
    },
  }
}
