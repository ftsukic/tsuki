import { OVERLAY_PRESETS, overlayAnimation } from '../motion/presets'
import {
  forwardRef,
  isValidElement,
  useContext,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Animated, useTransitionProgress } from '../motion'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { NotifyMethods, NotifyProps } from './types'
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
    color,
    backgroundColor,
    visible: visibleProp = true,
    duration = 0,
    safeAreaInsetTop = true,
    style,
    styles,
    onClosed,
    ...props
  },
  ref,
) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Notify', getNotifyToken)
  const safeAreaInsets = useContext(SafeAreaInsetsContext)
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
  const topInset = safeAreaInsetTop ? Math.max(0, safeAreaInsets?.top ?? 0) : 0

  const animationDuration = themeToken.motion ? themeToken.motionDurationSlow : 0
  const enteringConfig = useMemo(
    () => ({
      duration: animationDuration,
      ...overlayAnimation(animationDuration, true),
      mode: 'timing' as const,
    }),
    [animationDuration],
  )
  const leavingConfig = useMemo(
    () => ({
      duration: animationDuration,
      ...overlayAnimation(animationDuration, false),
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
    preset: OVERLAY_PRESETS.popupTop,
    distance: 100,
    opacity: 1,
    entering: enteringConfig,
    leaving: leavingConfig,
    onTransitionEnd: handleTransitionEnd,
  })

  const semantic = resolveStyles(styles, {
    props: {
      ...props,
      children,
      message,
      type,
      color,
      backgroundColor,
      visible: visibleProp,
      duration,
      safeAreaInsetTop,
      style,
      styles,
      onClosed,
    },
    state: { visible },
  })

  if (!rendered) return null

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: themeToken.zIndexPopupBase }]}
    >
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={[{ width: '100%' }, animatedStyle]}
      >
        <View
          {...props}
          style={[
            {
              alignItems: 'center',
              backgroundColor: backgroundColor ?? getBackgroundColor(type, token),
              justifyContent: 'center',
              paddingBottom: token.paddingVertical,
              paddingTop: token.paddingVertical + topInset,
              paddingHorizontal: token.paddingHorizontal,
              width: '100%',
            },
            semantic?.root,
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
                semantic?.content,
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
    <Portal hostName="root">
      <NotifyContent {...props} ref={ref} />
    </Portal>
  )
})

Notify.displayName = 'Notify'
