import { forwardRef, isValidElement, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Popup } from '../popup'
import type { NotifyMethods, NotifyProps } from './interface'
import { Text, View } from 'react-native'

const backgrounds = {
  primary: '#1989FA',
  success: '#07C160',
  error: '#EE0A24',
  warning: '#FF976A',
} as const

export const Notify = forwardRef<NotifyMethods, NotifyProps>(function Notify(
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
    <Popup
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
            backgroundColor: backgroundColor ?? backgrounds[type],
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            width: '100%',
          },
          style,
        ]}
      >
        {typeof content === 'string' || typeof content === 'number' ? (
          <Text style={[{ color, fontSize: 14, lineHeight: 20 }, textStyle]}>{content}</Text>
        ) : (
          content
        )}
      </View>
    </Popup>
  )
})

Notify.displayName = 'Notify'
