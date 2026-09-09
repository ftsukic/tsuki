import type { TextStyle, ViewStyle } from 'react-native'
import type { SearchToken } from '../theme'
import type { SearchProps, SearchStyleState } from './Search.types'

export interface SearchResolvedStyles {
  root: ViewStyle
  container: ViewStyle
  prefix: ViewStyle
  suffix: ViewStyle
  /** @deprecated Use prefix. */
  leftIcon: ViewStyle
  input: TextStyle
  clear: ViewStyle
}

function getSearchHeight(
  token: SearchToken,
  size: NonNullable<SearchProps['size']>,
  height?: SearchProps['height'],
) {
  if (height !== undefined) return height

  switch (size) {
    case 'small':
      return token.search_height_small
    case 'large':
      return token.search_height_large
    case 'medium':
    default:
      return token.search_height_medium
  }
}

export function getSearchStyles(
  token: SearchToken,
  props: SearchProps,
  state: SearchStyleState,
): SearchResolvedStyles {
  const height = getSearchHeight(token, props.size ?? 'medium', props.height)
  const multiline = props.multiline === true

  return {
    root: {
      width: '100%',
      minWidth: 0,
      opacity: state.disabled ? token.search_disabled_opacity : 1,
    },
    container: {
      width: '100%',
      minWidth: 0,
      ...(multiline ? { minHeight: height } : { height }),
      flexDirection: 'row',
      alignItems: multiline ? 'stretch' : 'center',
      paddingHorizontal: token.search_padding_horizontal,
      borderRadius: props.shape === 'square' ? 0 : token.search_border_radius,
      backgroundColor: state.disabled
        ? token.search_disabled_background_color
        : (props.background ?? token.search_background_color),
    },
    prefix: {
      minWidth: token.search_icon_size,
      height: '100%',
      flexShrink: 0,
      marginRight: token.search_prefix_spacing,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftIcon: {
      minWidth: token.search_icon_size,
      height: '100%',
      flexShrink: 0,
      marginRight: token.search_prefix_spacing,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 0,
      ...(multiline
        ? {}
        : {
            height,
            paddingVertical: 0,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }),
      color: state.disabled ? token.search_disabled_text_color : token.search_text_color,
      fontFamily: token.search_font_family,
      fontSize: token.search_font_size,
      lineHeight: token.search_line_height,
    },
    suffix: {
      minWidth: token.search_clear_size,
      height: '100%',
      flexShrink: 0,
      marginLeft: token.search_suffix_spacing,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clear: {
      width: Math.max(32, token.search_clear_size + token.search_suffix_spacing * 2),
      height: '100%',
      flexShrink: 0,
      minHeight: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }
}
