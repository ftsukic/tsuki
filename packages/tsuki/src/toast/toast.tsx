import Animated from 'react-native-reanimated'
import { useTransitionProgress } from '../motion/useTransitionProgress'
import { OVERLAY_PRESETS } from '../motion/presets'
import { forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { IconDefinition } from '@ant-design/icons-svg/lib/types'
import { Icon } from '../icon'
import { isIconName } from '../icon/icon-definitions'
import { Loading } from '../loading'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import type { ToastIcon, ToastProps, ToastType } from './types'
import { getToastToken } from './token'

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function isIconDefinition(value: unknown): value is IconDefinition {
  return Boolean(
    value && typeof value === 'object' && 'icon' in value && 'name' in value && 'theme' in value,
  )
}

function getDefaultIcon(type: ToastType) {
  if (type === 'success') return 'CheckOutlined'
  if (type === 'fail') return 'CloseOutlined'
  return null
}

function renderMessage(value: ToastProps['message']) {
  if (!isRenderable(value)) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  return value
}

interface ToastContentProps extends ToastProps {
  timerKey?: number
}

export const ToastContent = forwardRef<View, ToastContentProps>(function ToastContent(props, ref) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Toast', getToastToken)
  const {
    show = false,
    timerKey,
    type = 'text',
    message,
    children,
    icon,
    iconSize = token.iconSize,
    position = 'middle',
    duration = token.duration,
    loadingType = 'circular',
    overlay = false,
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
  }, [message, normalizedDuration, show, type, timerKey])

  const showRef = useRef(show)
  showRef.current = show
  useEffect(() => {
    if (show) {
      renderedRef.current = true
      setRendered(true)
    }
  }, [show])
  const { animatedStyle } = useTransitionProgress({
    visible: show,
    preset: OVERLAY_PRESETS.toast,
    entering: { duration: animationDuration },
    leaving: { duration: animationDuration },
    onTransitionEnd: (entered) => {
      if (showRef.current !== entered) return
      if (entered) onOpenedRef.current?.()
      else if (renderedRef.current) {
        renderedRef.current = false
        setRendered(false)
        onCloseRef.current?.()
      }
    },
  })

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

  const resolvedIcon: ToastIcon = icon === undefined ? getDefaultIcon(type) : icon
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
      accessible={show}
      accessibilityElementsHidden={!show}
      importantForAccessibility={show ? viewProps.importantForAccessibility : 'no-hide-descendants'}
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
        },
        textMode
          ? {
              minWidth: token.textMinWidth,
              paddingHorizontal: token.textPaddingHorizontal,
              paddingVertical: token.textPaddingVertical,
            }
          : {
              minHeight: token.defaultMinHeight,
              paddingHorizontal: token.defaultPaddingHorizontal,
              paddingVertical: token.defaultPaddingVertical,
              width: token.defaultWidth,
            },
        semantic?.root,
        style,
        animatedStyle,
      ]}
    >
      {iconNode}
      {messageNode !== undefined && messageNode !== null && messageNode !== false ? (
        typeof messageNode === 'string' || typeof messageNode === 'number' ? (
          <Text
            style={[
              {
                color: token.textColor,
                fontFamily: token.fontFamily,
                fontSize: token.fontSize,
                flexShrink: 1,
                lineHeight: token.lineHeight,
                marginTop: iconNode ? token.iconTextGap : 0,
                textAlign: 'center',
              },
              semantic?.content,
            ]}
          >
            {messageNode}
          </Text>
        ) : (
          <View style={[{ marginTop: iconNode ? token.iconTextGap : 0 }, semantic?.content]}>
            {messageNode}
          </View>
        )
      ) : null}
    </Animated.View>
  )

  return (
    <View
      pointerEvents={show ? (intercepts ? 'auto' : 'box-none') : 'none'}
      style={[StyleSheet.absoluteFill, { zIndex }]}
    >
      {overlay ? (
        <Pressable
          accessibilityElementsHidden
          onPress={closeOnClickOverlay ? () => onShowChange?.(false) : undefined}
          style={[StyleSheet.absoluteFill, { backgroundColor: token.overlayColor }, semantic?.mask]}
        />
      ) : forbidClick ? (
        <View pointerEvents="auto" style={StyleSheet.absoluteFill} />
      ) : null}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, positionStyle]}>
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
    <Portal hostName="root">
      <ToastContent {...props} ref={ref} />
    </Portal>
  )
})

Toast.displayName = 'Toast'
