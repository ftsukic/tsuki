import { useCallback, useEffect, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { View } from 'react-native'
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import { useToken } from '../theme'
import { getNoticeBarStyles } from './style'
import { NoticeBarItem } from './NoticeBarItem'
import type { NoticeBarProps } from './interface'

const NOTICE_BAR_DEFAULT_DELAY = 1
const NOTICE_BAR_DEFAULT_SPEED = 60

function normalizeDelay(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, value as number) : NOTICE_BAR_DEFAULT_DELAY
}

function normalizeSpeed(value: number | undefined): number {
  return Number.isFinite(value) && (value as number) > 0
    ? (value as number)
    : NOTICE_BAR_DEFAULT_SPEED
}

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function getLayoutWidth(event: LayoutChangeEvent): number | null {
  const width = event.nativeEvent.layout.width
  return Number.isFinite(width) && width >= 0 ? width : null
}

export function NoticeBar({
  text = '',
  children,
  leftIcon,
  rightIcon,
  visible: visibleProp = true,
  disabled = false,
  scrollable,
  wrapable = false,
  speed = NOTICE_BAR_DEFAULT_SPEED,
  delay = NOTICE_BAR_DEFAULT_DELAY,
  onClick,
  onClose,
}: NoticeBarProps) {
  const { token } = useToken()
  const [shown, setShown] = useState(visibleProp)
  const [wrapWidth, setWrapWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const [scrolling, setScrolling] = useState(false)
  const translateX = useSharedValue(0)
  const content = children !== undefined ? children : text
  const effectiveVisible = shown && visibleProp
  const shouldScroll =
    effectiveVisible &&
    !wrapable &&
    wrapWidth > 0 &&
    contentWidth > 0 &&
    (scrollable === true || (scrollable !== false && contentWidth > wrapWidth))
  const styles = getNoticeBarStyles(token, wrapable, disabled)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  useEffect(() => {
    setShown(visibleProp)
  }, [visibleProp])

  useEffect(() => {
    setContentWidth(0)
    setScrolling(false)
    cancelAnimation(translateX)
    translateX.value = 0
  }, [content, translateX])

  useEffect(() => {
    cancelAnimation(translateX)
    translateX.value = 0
    setScrolling(false)

    if (!shouldScroll || !token.motion) {
      return () => cancelAnimation(translateX)
    }

    const pixelsPerSecond = normalizeSpeed(speed)
    const initialDuration = Math.max(1, (contentWidth / pixelsPerSecond) * 1000)
    const loopDuration = Math.max(1, ((contentWidth + wrapWidth) / pixelsPerSecond) * 1000)
    const loop = withRepeat(
      withSequence(
        withTiming(wrapWidth, { duration: 0, easing: Easing.linear }),
        withTiming(-contentWidth, { duration: loopDuration, easing: Easing.linear }),
      ),
      -1,
      false,
    )

    translateX.value = withDelay(
      normalizeDelay(delay) * 1000,
      withSequence(
        withTiming(-contentWidth, { duration: initialDuration, easing: Easing.linear }),
        loop,
      ),
    )
    setScrolling(true)

    return () => cancelAnimation(translateX)
  }, [contentWidth, delay, shouldScroll, speed, token.motion, translateX, wrapWidth])

  const handleWrapLayout = useCallback((event: LayoutChangeEvent) => {
    const width = getLayoutWidth(event)
    if (width === null) return
    setWrapWidth((current) => (current === width ? current : width))
  }, [])

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const width = getLayoutWidth(event)
    if (width === null) return
    setContentWidth((current) => (current === width ? current : width))
  }, [])

  const handleClose = useCallback(() => {
    if (disabled || !effectiveVisible) return
    setShown(false)
    onClose?.()
  }, [disabled, effectiveVisible, onClose])

  if (!effectiveVisible) return null

  const itemMode = wrapable
    ? 'wrap'
    : scrolling
      ? 'scroll'
      : contentWidth > 0
        ? 'ellipsis'
        : 'measure'
  const resolvedRightIcon = onClose
    ? (rightIcon ?? (
        <Icon name="CloseOutlined" size={token.fontSizeLG} color={token.colorWarning} />
      ))
    : rightIcon

  return (
    <View accessibilityLiveRegion="polite" style={styles.root}>
      <InteractionPressable
        accessibilityRole="alert"
        accessibilityState={{ disabled }}
        accessible
        disabled={disabled}
        onPress={onClick}
        style={({ pressed }) => getNoticeBarStyles(token, wrapable, disabled, pressed).contentRoot}
      >
        {isRenderable(leftIcon) ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <View onLayout={handleWrapLayout} style={styles.wrap}>
          <NoticeBarItem
            animatedStyle={scrolling ? animatedStyle : undefined}
            mode={itemMode}
            onLayout={itemMode === 'measure' ? handleContentLayout : undefined}
            styles={styles}
          >
            {content}
          </NoticeBarItem>
        </View>
      </InteractionPressable>
      {isRenderable(resolvedRightIcon) ? (
        onClose ? (
          <InteractionPressable
            accessibilityLabel="关闭通知"
            accessibilityRole="button"
            disabled={disabled}
            onPress={handleClose}
            style={({ pressed }) => [
              styles.rightIcon,
              pressed && { opacity: token.motion ? 0.6 : 1 },
            ]}
          >
            {resolvedRightIcon}
          </InteractionPressable>
        ) : (
          <View style={styles.rightIcon}>{resolvedRightIcon}</View>
        )
      ) : null}
    </View>
  )
}

NoticeBar.displayName = 'NoticeBar'
