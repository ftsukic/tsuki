import { Button } from '../button'
import type { ButtonProps } from '../button'
import { easing, renderTextLikeJSX } from '../helpers'
import { Icon } from '../icon'
import { useLocale } from '../locale'
import { Popup } from '../popup'
import { mountPortal, unmountPortal } from '../portal'
import { useToken } from '../theme'
import type { DialogButtonProps, DialogProps, DialogShowOptions } from './interface'
import isNil from 'lodash/isNil'
import { memo, useRef, useState } from 'react'
import {
  Animated,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

export function Dialog({
  children,
  visible,
  style,
  theme,
  title,
  message,
  width,
  messageAlign = 'center',
  showConfirmButton = true,
  showCancelButton = false,
  confirmButtonText,
  cancelButtonText,
  confirmButtonColor,
  confirmButtonTextBold = true,
  cancelButtonColor,
  cancelButtonTextBold = false,
  confirmButtonLoading = false,
  cancelButtonLoading = false,
  showClose = false,
  onPressClose,
  buttonReverse = false,
  onPressCancel,
  onPressConfirm,
  footerStyle,
  cancelButtonProps,
  confirmButtonProps,
  duration,
  onOpen,
  onClose,
  ...props
}: DialogProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Dialog, ...theme }
  const buttonToken = components.Button
  const windowDimensions = useWindowDimensions()
  const locale = useLocale().Dialog
  const fade = useRef(new Animated.Value(visible ? 1 : 0)).current
  const runFade = (visible: boolean) =>
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: duration ?? token.transitionDuration,
      easing: visible ? easing.easeOutCirc : easing.easeInCubic,
      useNativeDriver: true,
    }).start()
  const titleNode = renderTextLikeJSX(title, [
    {
      color: token.headerColor,
      fontSize: token.headerFontSize,
      lineHeight: token.headerLineHeight,
      fontWeight: token.headerFontWeight,
      textAlign: 'center',
      paddingHorizontal: token.messagePaddingHorizontal,
      paddingTop: token.headerPaddingTop,
      paddingBottom: isNil(message) ? 0 : token.headerPaddingBottom,
    },
  ])
  const messageNode = !isNil(message) ? (
    typeof message === 'object' ? (
      message
    ) : (
      <Text
        style={{
          color: token.messageTextColor,
          fontSize: token.messageFontSize,
          lineHeight: token.messageLineHeight,
          textAlign: messageAlign,
          paddingHorizontal: token.messagePaddingHorizontal,
        }}
      >
        {message}
      </Text>
    )
  ) : null

  const getButtonActiveColor = (type: NonNullable<typeof cancelButtonProps>['type'] = 'link') => {
    if (type === 'primary') return buttonToken.primaryBgActive
    if (type === 'default') return buttonToken.defaultBgActive
    return buttonToken.textBgActive
  }

  const getButtonTextColor = (
    type: NonNullable<typeof cancelButtonProps>['type'],
    color: NonNullable<typeof cancelButtonProps>['textColor'],
    fallback: string,
  ) => {
    if (color !== undefined) return color
    if (type === 'primary') return buttonToken.primaryColor
    if (type === 'default') return buttonToken.defaultColor
    return fallback
  }

  const getButtonStyle =
    (
      buttonStyle: DialogButtonProps['style'],
      baseStyle: StyleProp<ViewStyle>,
      activeColor: string,
    ): ButtonProps['style'] =>
    (state) => [
      baseStyle,
      typeof buttonStyle === 'function' ? buttonStyle(state) : buttonStyle,
      state.pressed && { backgroundColor: activeColor },
    ]

  const cancelType = cancelButtonProps?.type ?? 'link'
  const confirmType = confirmButtonProps?.type ?? 'link'
  const cancel = (
    <Button
      {...cancelButtonProps}
      text={cancelButtonText ?? locale.cancelButtonText}
      textColor={getButtonTextColor(
        cancelType,
        cancelButtonProps?.textColor ?? cancelButtonColor,
        token.cancelTextColor,
      )}
      loading={cancelButtonLoading}
      type={cancelType}
      size={cancelButtonProps?.size ?? 'large'}
      square={cancelButtonProps?.square ?? !cancelButtonProps?.round}
      style={getButtonStyle(
        cancelButtonProps?.style,
        { flex: 1, marginHorizontal: 0, marginVertical: 0 },
        getButtonActiveColor(cancelType),
      )}
      textStyle={[
        cancelButtonTextBold ? { fontWeight: 'bold' } : undefined,
        cancelButtonProps?.textStyle,
      ]}
      onPress={onPressCancel}
    />
  )
  const confirm = (
    <Button
      {...confirmButtonProps}
      text={confirmButtonText ?? locale.confirmButtonText}
      textColor={getButtonTextColor(
        confirmType,
        confirmButtonProps?.textColor ?? confirmButtonColor,
        token.confirmTextColor,
      )}
      loading={confirmButtonLoading}
      type={confirmType}
      size={confirmButtonProps?.size ?? 'large'}
      square={confirmButtonProps?.square ?? !confirmButtonProps?.round}
      style={getButtonStyle(
        confirmButtonProps?.style,
        {
          flex: 1,
          marginHorizontal: 0,
          marginVertical: 0,
          borderLeftWidth: showCancelButton ? themeToken.lineWidth : 0,
          borderColor: token.footerDividerColor,
        },
        getButtonActiveColor(confirmType),
      )}
      textStyle={[
        confirmButtonTextBold ? { fontWeight: 'bold' } : undefined,
        confirmButtonProps?.textStyle,
      ]}
      onPress={onPressConfirm}
    />
  )
  const cancelFirst = buttonReverse ? showConfirmButton : showCancelButton
  const confirmFirst = buttonReverse ? showCancelButton : showConfirmButton
  return (
    <Popup
      {...props}
      visible={visible}
      duration={duration ?? token.transitionDuration}
      onOpen={() => {
        runFade(true)
        onOpen?.()
      }}
      onClose={() => {
        runFade(false)
        onClose?.()
      }}
    >
      <Animated.View
        style={[
          {
            width: width ?? Math.min(windowDimensions.width * 0.8, token.width),
            overflow: 'hidden',
            backgroundColor: token.backgroundColor,
            borderRadius: token.borderRadius,
            transform: [
              {
                scale: fade.interpolate({
                  inputRange: [0, 0.01, 0.98, 1],
                  outputRange: [0, 0.9, 1.02, 1],
                }),
              },
            ],
          },
          style,
        ]}
      >
        {showClose ? (
          <Icon
            name="CloseOutlined"
            style={{
              position: 'absolute',
              right: token.borderRadius,
              top: token.borderRadius,
              zIndex: 2,
            }}
            onPress={onPressClose}
            color={token.closeColor}
            size={token.closeSize}
          />
        ) : null}
        {titleNode}
        {titleNode ? (
          messageNode
        ) : (
          <View style={{ paddingTop: token.headerPaddingTop }}>{messageNode}</View>
        )}
        {children}
        {cancelFirst || confirmFirst ? (
          <View
            style={[
              {
                flexDirection: 'row',
                borderTopWidth: themeToken.lineWidth,
                borderColor: token.footerDividerColor,
                marginTop: token.footerMarginTop,
              },
              footerStyle,
            ]}
          >
            {cancelFirst ? cancel : null}
            {confirmFirst ? confirm : null}
          </View>
        ) : null}
      </Animated.View>
    </Popup>
  )
}

interface DialogMethodProps {
  options: DialogShowOptions
  resolve: () => void
  reject: (action: 'cancel' | 'overlay') => void
  onClosed: () => void
}

/** 将受控 Dialog 封装为 Promise API，行为对齐有赞的 showDialog。 */
function DialogMethod({ options, resolve, reject, onClosed }: DialogMethodProps) {
  const [visible, setVisible] = useState(true)
  const settledRef = useRef(false)

  const close = (action: 'confirm' | 'cancel' | 'overlay') => {
    if (settledRef.current) return
    settledRef.current = true
    setVisible(false)
    if (action === 'confirm') resolve()
    else reject(action)
  }

  return (
    <Dialog
      {...options}
      visible={visible}
      onPressConfirm={() => close('confirm')}
      onPressCancel={() => close('cancel')}
      onPressOverlay={() => close('overlay')}
      onRequestClose={() => {
        close('overlay')
        return true
      }}
      onPressClose={() => close('cancel')}
      onClosed={onClosed}
    />
  )
}

/** 显示命令式 Dialog，确认 resolve，取消或关闭 reject。 */
export function showDialog(options: DialogShowOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let key: number | null = null
    key = mountPortal(
      <DialogMethod
        options={options}
        resolve={resolve}
        reject={reject}
        onClosed={() => {
          if (key !== null) {
            unmountPortal(key)
            key = null
          }
        }}
      />,
    )
  })
}

export default memo(Dialog)
