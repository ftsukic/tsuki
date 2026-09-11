import type { TextStyle, ViewStyle } from 'react-native'
import type { SearchToken } from '../theme'
import type { SearchProps, SearchStyleState } from './Search.types'

export interface SearchResolvedStyles {
  root: ViewStyle
  left: ViewStyle
  content: ViewStyle
  inputShell: ViewStyle
  prefix: ViewStyle
  label: TextStyle
  input: TextStyle
  action: ViewStyle
}

export function getSearchStyles(
  token: SearchToken,
  props: SearchProps,
  state: SearchStyleState,
): SearchResolvedStyles {
  const contentRadius =
    props.shape === 'round' ? token.search_round_border_radius : token.search_border_radius

  return {
    root: {
      width: '100%',
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: token.search_padding_horizontal,
      paddingVertical: token.search_padding_vertical,
      backgroundColor: props.background ?? token.search_background_color,
    },
    left: {
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: token.search_gap,
    },
    content: {
      flex: 1,
      minWidth: 0,
      height: token.search_height,
      borderRadius: contentRadius,
      backgroundColor: token.search_content_background_color,
    },
    inputShell: {
      height: token.search_height,
      minHeight: token.search_height,
      borderRadius: contentRadius,
      ...(state.disabled ? {} : { backgroundColor: token.search_content_background_color }),
    },
    prefix: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      marginLeft: token.search_label_spacing,
      color: state.disabled ? token.search_disabled_text_color : token.search_text_color,
    },
    input: {
      textAlign: props.inputAlign ?? 'left',
    },
    action: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: token.search_gap,
      gap: token.search_gap,
    },
  }
}
