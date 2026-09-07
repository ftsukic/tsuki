import { forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { IconDefinition } from '@ant-design/icons-svg/lib/types'
import { Icon, isIconName } from '../icon'
import { Loading } from '../loading'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { ToastIcon, ToastProps, ToastType } from './interface'
import { getToastToken } from './token'

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function isIconDefinition(value: unknown): value is IconDefinition {
  return Boolean(value && typeof value === 'object' && 'icon' in value && 'iconViewBox' in value)
}

function getDefaultIcon(type: ToastType) {
  if (type === 'success') return 'CheckCircleFilled'
  if (type === 'fail') return 'CloseCircleFilled'
  return null
}

function renderMessage(value: ToastProps['message']) {
  if (!isRenderable(value)) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  return value
}

const ToastContent = forwardRef<View, ToastProps>(function ToastContent(props, ref) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Toast', getToastToken)
  const {
    show = false,
    type = 'text',
    message,
    children,
    icon,
    iconSize = token.iconSize,
    position = 'middle',
    duration = token.duration,
    loadingType = 'circular',
    overlay = false,
    overlayStyle,
    forbidClick = false,
    closeOnClick = false,
    closeOnClickOverlay = false,
    zIndex = token.zIndex,
    style,
    styles,
    onShowChange,
    onClose,
    onOpened,
    ...viewProps
  } = props
  const opacity = useRef(new Animated.Value(show ? 1 : 0)).current
  const animation = useRef<Animated.CompositeAnimation | null>(null)
  const renderedRef = useRef(show)
  const onCloseRef = useRef(onClose)
  const onOpenedRef = useRef(onOpened)
  const onShowChangeRef = useRef(onShowChange)
  const [rendered, setRendered] = useState(show)
  onCloseRef.current = onClose
  onOpenedRef.current = onOpened
  onShowChangeRef.current = onShowChange
  const normalizedDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0
  const normalizedIconSize = Number.isFinite(iconSize) && iconSize > 0 ? iconSize : token.iconSize
  const animationDuration = themeToken.motion ? Math.max(0, token.animationDuration) : 0
  const hasCustomIcon = isRenderable(icon)
  const hasIcon = hasCustomIcon || type === 'success' || type === 'fail'
  const textMode = type === 'text' && !hasIcon
  const intercepts = overlay || forbidClick
  const semantic = resolveStyles(styles, {
    props,
    state: { show, type, position },
  })

  useEffect(() => {
    if (!show || normalizedDuration <= 0) return

    const timer = setTimeout(() => onShowChangeRef.current?.(false), normalizedDuration)
    return () => clearTimeout(timer)
  }, [message, normalizedDuration, show, type])

  useEffect(() => {
    animation.current?.stop()

    if (show) {
      renderedRef.current = true
      setRendered(true)
      if (animationDuration === 0) {
        opacity.setValue(1)
        onOpenedRef.current?.()
        return
      }

      opacity.setValue(0)
      const nextAnimation = Animated.timing(opacity, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        isInteraction: false,
        useNativeDriver: Platform.OS !== 'web',
      })
      animation.current = nextAnimation
      nextAnimation.start(({ finished }) => {
        if (finished) onOpenedRef.current?.()
      })
      return () => nextAnimation.stop()
    }

    if (!renderedRef.current) return
    if (animationDuration === 0) {
      renderedRef.current = false
      setRendered(false)
      onCloseRef.current?.()
      return
    }

    const nextAnimation = Animated.timing(opacity, {
      toValue: 0,
      duration: animationDuration,
      easing: Easing.in(Easing.cubic),
      isInteraction: false,
      useNativeDriver: Platform.OS !== 'web',
    })
    animation.current = nextAnimation
    nextAnimation.start(({ finished }) => {
      if (finished) {
        renderedRef.current = false
        setRendered(false)
        onCloseRef.current?.()
      }
    })
    return () => nextAnimation.stop()
  }, [animationDuration, opacity, show])

  useEffect(
    () => () => {
      animation.current?.stop()
    },
    [],
  )

  const positionStyle = useMemo(() => {
    switch (position) {
      case 'top':
        return {
          alignItems: 'center' as const,
          justifyContent: 'flex-start' as const,
          paddingTop: token.positionTopDistance,
        }
      case 'bottom':
        return {
          alignItems: 'center' as const,
          justifyContent: 'flex-end' as const,
          paddingBottom: token.positionBottomDistance,
        }
      case 'middle':
      default:
        return { alignItems: 'center' as const, justifyContent: 'center' as const }
    }
  }, [position, token.positionBottomDistance, token.positionTopDistance])

  if (!rendered) return null

  const resolvedIcon: ToastIcon = icon ?? getDefaultIcon(type)
  const iconNode = resolvedIcon ? (
    typeof resolvedIcon === 'string' && isIconName(resolvedIcon) ? (
      <Icon
        name={resolvedIcon}
        size={normalizedIconSize}
        color={token.textColor}
        style={semantic?.icon}
      />
    ) : isIconDefinition(resolvedIcon) ? (
      <Icon
        name={resolvedIcon}
        size={normalizedIconSize}
        color={token.textColor}
        style={semantic?.icon}
      />
    ) : isValidElement(resolvedIcon) ? (
      <View
        style={[
          {
            alignItems: 'center',
            height: normalizedIconSize,
            justifyContent: 'center',
            width: normalizedIconSize,
          },
          semantic?.icon,
        ]}
      >
        {resolvedIcon}
      </View>
    ) : null
  ) : type === 'loading' ? (
    <View style={[{ padding: 4 }, semantic?.loading]}>
      <Loading color={token.loadingIconColor} size={normalizedIconSize} type={loadingType} />
    </View>
  ) : null

  const messageNode = children !== undefined ? children : renderMessage(message)
  const bubble = (
    <Animated.View
      ref={ref}
      {...viewProps}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents={closeOnClick || children !== undefined ? 'auto' : 'none'}
      style={[
        {
          alignItems: 'center',
          backgroundColor: token.backgroundColor,
          borderRadius: token.borderRadius,
          justifyContent: 'center',
          maxWidth: token.maxWidth,
          opacity,
        },
        textMode
          ? {
              minWidth: token.textMinWidth,
              paddingHorizontal: token.textPaddingHorizontal,
              paddingVertical: token.textPaddingVertical,
            }
          : {
              minHeight: token.defaultMinHeight,
              padding: token.defaultPadding,
              width: token.defaultWidth,
            },
        semantic?.root,
        style,
      ]}
    >
      {iconNode}
      {messageNode !== undefined && messageNode !== null && messageNode !== false ? (
        typeof messageNode === 'string' || typeof messageNode === 'number' ? (
          <Text
            style={[
              {
                color: token.textColor,
                fontSize: token.fontSize,
                lineHeight: token.lineHeight,
                marginTop: iconNode ? token.textPaddingVertical : 0,
                maxWidth: token.maxWidth,
                textAlign: 'center',
              },
              semantic?.message,
            ]}
          >
            {messageNode}
          </Text>
        ) : (
          messageNode
        )
      ) : null}
    </Animated.View>
  )

  return (
    <View
      pointerEvents={intercepts ? 'auto' : 'box-none'}
      style={[StyleSheet.absoluteFillObject, { zIndex }, semantic?.host]}
    >
      {overlay ? (
        <Pressable
          accessibilityElementsHidden
          onPress={closeOnClickOverlay ? () => onShowChange?.(false) : undefined}
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: token.overlayColor },
            overlayStyle,
            semantic?.overlay,
          ]}
        />
      ) : forbidClick ? (
        <View pointerEvents="auto" style={StyleSheet.absoluteFillObject} />
      ) : null}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFillObject, positionStyle]}>
        {closeOnClick ? (
          <Pressable onPress={() => onShowChange?.(false)}>{bubble}</Pressable>
        ) : (
          bubble
        )}
      </View>
    </View>
  )
})

export const Toast = forwardRef<View, ToastProps>(function Toast(props, ref) {
  return (
    <Portal>
      <ToastContent {...props} ref={ref} />
    </Portal>
  )
})

Toast.displayName = 'Toast'
