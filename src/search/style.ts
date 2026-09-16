import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, SearchToken } from '../theme'
import type { SearchProps, SearchStyleState } from './types'

export interface SearchResolvedStyles {
  root: ViewStyle
  divider: ViewStyle
  left: ViewStyle
  content: ViewStyle
  prefix: ViewStyle
  label: TextStyle
  action: ViewStyle
}

export function getSearchStyles(
  token: SearchToken,
  aliasToken: AliasToken,
  props: SearchProps,
  state: SearchStyleState,
): SearchResolvedStyles {
  return {
    root: {
      width: '100%',
      minWidth: 0,
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: token.search_padding_horizontal,
      paddingVertical: token.search_padding_vertical,
      backgroundColor: props.background ?? token.search_background_color,
    },
    divider: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
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
    },
    prefix: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      marginLeft: token.search_label_spacing,
      color: state.disabled ? aliasToken.colorTextDisabled : aliasToken.colorText,
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
