import { forwardRef, isValidElement, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PopupContent } from '../popup/popup'
import { Portal } from '../portal'
import { useComponentToken } from '../theme'
import type { NotifyMethods, NotifyProps } from './interface'
import { getNotifyToken } from './token'
import { Text, View } from 'react-native'

function getBackgroundColor(type: NotifyProps['type'], token: ReturnType<typeof getNotifyToken>) {
  switch (type) {
    case 'success':
      return token.successBackgroundColor
    case 'error':
      return token.errorBackgroundColor
    case 'warning':
      return token.warningBackgroundColor
    case 'primary':
    default:
      return token.primaryBackgroundColor
  }
}

export const NotifyContent = forwardRef<NotifyMethods, NotifyProps>(function NotifyContent(
  {
    children,
    message,
    type = 'primary',
    color = '#ffffff',
    backgroundColor,
    visible: visibleProp = true,
    duration = 0,
    style,
    textStyle,
    onClosed,
    ...props
  },
  ref,
) {
  const token = useComponentToken('Notify', getNotifyToken)
  const [visible, setVisible] = useState(visibleProp)
  const [currentMessage, setCurrentMessage] = useState(message)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  useEffect(() => setVisible(visibleProp), [visibleProp])
  useEffect(() => {
    setCurrentMessage(message)
  }, [message])
  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  useImperativeHandle(
    ref,
    () => ({
      close: () => setVisible(false),
      setMessage: setCurrentMessage,
    }),
    [],
  )

  const content = isValidElement(currentMessage) ? currentMessage : (currentMessage ?? children)

  return (
    <PopupContent
      {...props}
      visible={visible}
      overlay={false}
      position="top"
      onClosed={onClosedRef.current}
    >
      <View
        style={[
          {
            alignItems: 'center',
            backgroundColor: backgroundColor ?? getBackgroundColor(type, token),
            paddingHorizontal: token.paddingHorizontal,
            paddingVertical: token.paddingVertical,
            justifyContent: 'center',
            width: '100%',
          },
          style,
        ]}
      >
        {typeof content === 'string' || typeof content === 'number' ? (
          <Text
            style={[
              {
                color: color ?? token.textColor,
                fontFamily: token.fontFamily,
                fontSize: token.fontSize,
                lineHeight: token.lineHeight,
              },
              textStyle,
            ]}
          >
            {content}
          </Text>
        ) : (
          content
        )}
      </View>
    </PopupContent>
  )
})

NotifyContent.displayName = 'Notify.Content'

export const Notify = forwardRef<NotifyMethods, NotifyProps>(function Notify(props, ref) {
  return (
    <Portal>
      <NotifyContent {...props} ref={ref} />
    </Portal>
  )
})

Notify.displayName = 'Notify'
