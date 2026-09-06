import { attachPropertiesToComponent } from '../helpers'
import { Icon } from '../icon'
import { Loading } from '../loading'
import { Popup } from '../popup'
import { mountPortal, unmountPortal } from '../portal'
import { useToken } from '../theme'
import type { ToastMethods, ToastProps } from './interface'
import isNil from 'lodash/isNil'
import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'
import { Text, TouchableWithoutFeedback, View } from 'react-native'

const ToastView = forwardRef<ToastMethods, ToastProps>(
  (
    {
      theme,
      type = 'text',
      position = 'middle',
      message,
      overlay = false,
      forbidPress = false,
      closeOnPress = false,
      closeOnPressOverlay = false,
      loadingType = 'circular',
      duration = 2000,
      icon,
      onClosed,
    },
    ref,
  ) => {
    const { components } = useToken()
    const token = { ...components.Toast, ...theme }
    const shouldBlockPress = forbidPress || overlay
    const [visible, setVisible] = useState(false)
    const [text, setText] = useState(message)
    useEffect(() => {
      setVisible(true)
      if (duration !== 0) {
        const timer = setTimeout(() => setVisible(false), duration)
        return () => clearTimeout(timer)
      }
    }, [duration])
    useImperativeHandle(ref, () => ({ close: () => setVisible(false), setMessage: setText }), [])
    const iconNode =
      type === 'loading' ? (
        <Loading
          type={loadingType === 'circular' ? 'circular' : 'spinner'}
          size={token.iconSize}
          color={token.iconColor}
        />
      ) : type === 'success' ? (
        <Icon name="CheckCircleOutlined" size={token.iconSize} color={token.iconColor} />
      ) : type === 'fail' ? (
        <Icon name="CloseCircleOutlined" size={token.iconSize} color={token.iconColor} />
      ) : type === 'icon' ? (
        icon
      ) : null
    return (
      <Popup
        visible={visible}
        onClosed={onClosed}
        overlay={shouldBlockPress}
        overlayBackgroundColor={forbidPress && !overlay ? 'transparent' : undefined}
        onPressOverlay={() => closeOnPressOverlay && setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => closeOnPress && setVisible(false)}>
          <View
            pointerEvents={forbidPress ? undefined : 'box-none'}
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent:
                position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center',
              paddingTop: position === 'top' ? '20%' : undefined,
              paddingBottom: position === 'bottom' ? '20%' : undefined,
            }}
          >
            <View
              style={{
                backgroundColor: token.backgroundColor,
                borderRadius: type === 'text' ? token.textBorderRadius : token.borderRadius,
                paddingHorizontal:
                  type === 'text' ? token.textPaddingHorizontal : token.innerPaddingHorizontal,
                paddingVertical:
                  type === 'text' ? token.textPaddingVertical : token.innerPaddingVertical,
                width: type === 'text' ? undefined : token.innerWidth,
                minWidth: type === 'text' ? token.textMinWidth : undefined,
                minHeight: type === 'text' ? undefined : token.innerMinHeight,
                maxWidth: '70%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {type !== 'text' ? (
                <View style={{ padding: token.iconPadding }}>{iconNode}</View>
              ) : null}
              {!isNil(text) && text !== '' ? (
                <Text
                  style={{
                    color: token.textColor,
                    fontSize: token.fontSize,
                    lineHeight: token.lineHeight,
                    textAlign: 'center',
                    marginTop: type === 'text' ? 0 : token.textMarginTop,
                  }}
                >
                  {text}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Popup>
    )
  },
)

ToastView.displayName = 'Toast'

let toastKey: number | null = null
let toastClose: (() => void) | null = null

/** 显示全局 Toast，并返回可控制当前 Toast 的方法。 */
export function showToast(options: ToastProps | string): ToastMethods {
  const toastOptions: ToastProps =
    typeof options === 'string' ? { message: options, type: 'text' } : options

  if (toastKey !== null) unmountPortal(toastKey)
  toastKey = null
  toastClose = null
  const ref = { current: null as ToastMethods | null }
  const close = () => {
    ref.current?.close()
  }
  toastClose = close
  let key: number | null = null
  toastKey = mountPortal(
    <ToastView
      ref={ref}
      {...toastOptions}
      onClosed={() => {
        toastOptions.onClosed?.()
        if (toastKey === key && key !== null) {
          unmountPortal(key)
          toastKey = null
          toastClose = null
        }
      }}
    />,
  )
  key = toastKey
  return {
    close,
    setMessage: (message) => ref.current?.setMessage(message),
  }
}

export const Toast = attachPropertiesToComponent(memo(ToastView), {
  show: showToast,
  hide: () => {
    if (toastKey !== null) {
      if (toastClose) toastClose()
      else {
        unmountPortal(toastKey)
        toastKey = null
      }
    }
  },
})

export default Toast
