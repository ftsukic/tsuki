import {
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { Animated, motionPresets, useTransitionProgress } from '../motion'
import { Portal } from '../portal'
import { useComponentToken, useToken } from '../theme'
import type { NotifyMethods, NotifyProps } from './interface'
import { getNotifyToken } from './token'

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
  const { token: themeToken } = useToken()
  const token = useComponentToken('Notify', getNotifyToken)
  const [visible, setVisible] = useState(visibleProp)
  const [currentMessage, setCurrentMessage] = useState(message)
  const renderedRef = useRef(visibleProp)
  const visibleRef = useRef(visibleProp)
  const closingRef = useRef(false)
  const closedNotifiedRef = useRef(!visibleProp)
  const [rendered, setRendered] = useState(visibleProp)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  useEffect(() => setVisible(visibleProp), [visibleProp])
  useEffect(() => {
    const wasVisible = visibleRef.current
    visibleRef.current = visible

    if (visible) {
      renderedRef.current = true
      setRendered(true)
      closingRef.current = false
      closedNotifiedRef.current = false
      return
    }

    if (wasVisible && renderedRef.current) {
      closingRef.current = true
      closedNotifiedRef.current = false
    }
  }, [visible])
  useEffect(() => {
    setCurrentMessage(message)
  }, [message])
  useEffect(() => {
    if (!visible || duration <= 0) return
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration, currentMessage, visible])

  useImperativeHandle(
    ref,
    () => ({
      close: () => setVisible(false),
      setMessage: setCurrentMessage,
    }),
    [],
  )

  const content = isValidElement(currentMessage) ? currentMessage : (currentMessage ?? children)

  const animationDuration = themeToken.motion ? themeToken.motionDurationSlow : 0
  const enteringConfig = useMemo(
    () => ({
      duration: animationDuration,
      easing: Easing.out(Easing.ease),
      mode: 'timing' as const,
    }),
    [animationDuration],
  )
  const leavingConfig = useMemo(
    () => ({
      duration: animationDuration,
      easing: Easing.in(Easing.ease),
      mode: 'timing' as const,
    }),
    [animationDuration],
  )
  const handleTransitionEnd = useCallback((transitionVisible: boolean) => {
    if (
      transitionVisible ||
      visibleRef.current ||
      !renderedRef.current ||
      !closingRef.current ||
      closedNotifiedRef.current
    ) {
      return
    }

    closedNotifiedRef.current = true
    closingRef.current = false
    renderedRef.current = false
    setRendered(false)
    onClosedRef.current?.()
  }, [])
  const { animatedStyle } = useTransitionProgress({
    visible,
    preset: motionPresets.popupTop,
    distance: 100,
    opacity: 1,
    entering: enteringConfig,
    leaving: leavingConfig,
    onTransitionEnd: handleTransitionEnd,
  })

  if (!rendered) return null

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: themeToken.zIndexPopupBase }]}
    >
      <Animated.View
        {...props}
        pointerEvents={visible ? 'auto' : 'none'}
        style={[{ width: '100%' }, animatedStyle]}
      >
        <View
          style={[
            {
              alignItems: 'center',
              backgroundColor: backgroundColor ?? getBackgroundColor(type, token),
              justifyContent: 'center',
              paddingHorizontal: token.paddingHorizontal,
              paddingVertical: token.paddingVertical,
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
      </Animated.View>
    </View>
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
