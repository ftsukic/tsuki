import { StyleSheet } from 'react-native'
import type { TextStyle, ViewStyle } from 'react-native'
import type { PickerToken } from '../theme'

export interface PickerResolvedStyles {
  root: ViewStyle
  container: ViewStyle
  toolbar: ViewStyle
  toolbarButton: ViewStyle
  toolbarButtonLabel: TextStyle
  toolbarTitle: TextStyle
  toolbarTitleContainer: ViewStyle
  view: ViewStyle
  columns: ViewStyle
  column: ViewStyle
  item: ViewStyle
  itemLabel: TextStyle
  mask: ViewStyle
  indicator: ViewStyle
  stateBackdrop: ViewStyle
  stateItem: ViewStyle
}

export function getPickerStyles(
  token: PickerToken,
  itemHeight: number,
  visibleItemCount: number,
  showToolbarDivider = false,
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
      justifyContent: 'space-between',
      ...(showToolbarDivider
        ? {
            borderBottomColor: token.picker_indicator_color,
            borderBottomWidth: token.picker_border_width,
          }
        : null),
    },
    toolbarButton: {
      minWidth: token.picker_toolbar_height,
      height: token.picker_toolbar_height,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.picker_toolbar_padding_horizontal,
    },
    toolbarButtonLabel: {
      color: token.picker_text_color,
      fontFamily: token.picker_font_family,
      fontSize: token.picker_toolbar_button_font_size,
      lineHeight: token.picker_toolbar_button_line_height,
    },
    toolbarTitle: {
      color: token.picker_toolbar_title_color,
      fontFamily: token.picker_font_family,
      fontSize: token.picker_item_font_size,
      fontWeight: '600',
      lineHeight: token.picker_toolbar_button_line_height,
      textAlign: 'center',
    },
    toolbarTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    view: {
      position: 'relative',
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
      height: viewHeight,
      overflow: 'hidden',
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
      zIndex: 1,
    },
    indicator: {
      position: 'absolute',
      top: indicatorTop,
      right: token.picker_indicator_horizontal_inset,
      left: token.picker_indicator_horizontal_inset,
      height: itemHeight,
      zIndex: 2,
      borderTopColor: token.picker_indicator_color,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomColor: token.picker_indicator_color,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    stateBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: viewHeight,
      backgroundColor: token.picker_background_color,
      zIndex: 3,
    },
    stateItem: {
      position: 'absolute',
      top: indicatorTop,
      right: 0,
      left: 0,
      height: itemHeight,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 4,
    },
  }
}
