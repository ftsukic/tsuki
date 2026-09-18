import { StyleSheet } from 'react-native'
import type { TextStyle, ViewStyle } from 'react-native'
import type { DialogProps, DialogStyleState } from './types'
import type { DialogToken } from '../theme'

export interface DialogResolvedStyles {
  popupPanel: ViewStyle
  panel: ViewStyle
  header: ViewStyle
  title: TextStyle
  content: ViewStyle
  message: TextStyle
  footer: ViewStyle
  cancel: ViewStyle
  confirm: ViewStyle
}

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

export function getDialogStyles(
  token: DialogToken,
  props: DialogProps,
  _state: DialogStyleState,
  bodyMaxHeight: number,
): DialogResolvedStyles {
  const titleVisible = isRenderable(props.title)
  const body = props.children !== undefined ? props.children : props.message
  const bodyVisible = isRenderable(body)
  const roundButtons = props.theme === 'round-button'
  const buttonHeight = roundButtons ? token.roundButtonHeight : token.buttonHeight
  const footerHeight = roundButtons ? buttonHeight + token.footerPaddingVertical * 2 : buttonHeight

  return {
    popupPanel: {
      width: props.width ?? token.width,
      maxWidth: token.smallScreenWidth,
    },
    panel: {
      width: '100%',
      backgroundColor: token.backgroundColor,
      borderRadius: token.borderRadius,
      overflow: 'hidden',
    },
    header: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.headerPaddingHorizontal,
      paddingTop:
        titleVisible && bodyVisible ? token.headerPaddingTop : token.headerIsolatedPaddingVertical,
      paddingBottom:
        titleVisible && bodyVisible
          ? token.headerPaddingBottom
          : token.headerIsolatedPaddingVertical,
    },
    title: {
      fontFamily: token.fontFamily,
      color: token.titleColor,
      fontSize: token.titleFontSize,
      fontWeight: token.headerFontWeight,
      lineHeight: token.titleLineHeight,
      textAlign: 'center',
    },
    content: {
      maxHeight: bodyMaxHeight,
      paddingHorizontal: token.messagePaddingHorizontal,
      paddingTop: titleVisible ? token.messagePaddingTop : token.messagePaddingHorizontal,
      paddingBottom: token.messagePaddingBottom,
    },
    message: {
      fontFamily: token.fontFamily,
      color: token.messageColor,
      fontSize: token.fontSize,
      lineHeight: token.messageLineHeight,
      textAlign: props.messageAlign ?? 'center',
    },
    footer: roundButtons
      ? {
          flexDirection: 'row',
          height: footerHeight,
          gap: token.buttonGap,
          paddingHorizontal: token.footerPaddingHorizontal,
          paddingVertical: token.footerPaddingVertical,
        }
      : {
          flexDirection: 'row',
          height: footerHeight,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: token.dividerColor,
        },
    cancel: {
      flex: 1,
      minWidth: 0,
      minHeight: buttonHeight,
      borderRadius: roundButtons ? 999 : 0,
    },
    confirm: {
      flex: 1,
      minWidth: 0,
      minHeight: buttonHeight,
      borderRadius: roundButtons ? 999 : 0,
    },
  }
}
