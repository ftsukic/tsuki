import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { LayoutChangeEvent, StyleProp, TextStyle } from 'react-native'
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
import { NoticeBarItem } from './notice-bar-item'
import type { NoticeBarResolvedStyles } from './style'

const NOTICE_BAR_DEFAULT_DELAY = 1
const NOTICE_BAR_DEFAULT_SPEED = 60

interface NoticeBarContentProps {
  content?: ReactNode
  delay?: number
  motion: boolean
  scrollable?: boolean
  speed?: number
  styles: NoticeBarResolvedStyles
  textStyle?: StyleProp<TextStyle>
  wrapable: boolean
}

function normalizeDelay(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, value as number) : NOTICE_BAR_DEFAULT_DELAY
}

function normalizeSpeed(value: number | undefined): number {
  return Number.isFinite(value) && (value as number) > 0
    ? (value as number)
    : NOTICE_BAR_DEFAULT_SPEED
}

function getLayoutWidth(event: LayoutChangeEvent): number | null {
  const width = event.nativeEvent.layout.width
  return Number.isFinite(width) && width >= 0 ? width : null
}

export function NoticeBarContent({
  content,
  delay,
  motion,
  scrollable,
  speed,
  styles,
  textStyle,
  wrapable,
}: NoticeBarContentProps) {
  const [wrapWidth, setWrapWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const [scrolling, setScrolling] = useState(false)
  const translateX = useSharedValue(0)
  const shouldScroll =
    !wrapable &&
    wrapWidth > 0 &&
    contentWidth > 0 &&
    (scrollable === true || (scrollable !== false && contentWidth > wrapWidth))
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  const resetAnimation = useCallback(() => {
    cancelAnimation(translateX)
    translateX.value = 0
    setScrolling(false)
  }, [translateX])

  useEffect(() => {
    resetAnimation()

    if (!shouldScroll || !motion) {
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
  }, [
    content,
    contentWidth,
    delay,
    motion,
    resetAnimation,
    shouldScroll,
    speed,
    translateX,
    wrapWidth,
  ])

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

  const mode = wrapable ? 'wrap' : scrolling ? 'scroll' : contentWidth > 0 ? 'ellipsis' : 'measure'
  const primitive = typeof content === 'string' || typeof content === 'number'

  return (
    <View onLayout={handleWrapLayout} style={styles.wrap}>
      <NoticeBarItem
        animatedStyle={scrolling ? animatedStyle : undefined}
        mode={!primitive && !wrapable && !scrolling ? 'measure' : mode}
        onLayout={!primitive && !wrapable ? handleContentLayout : undefined}
        styles={styles}
        textStyle={textStyle}
      >
        {content}
      </NoticeBarItem>
      {primitive && !wrapable ? (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, top: 0, opacity: 0, flexDirection: 'row' }}
        >
          <NoticeBarItem
            mode="measure"
            onLayout={handleContentLayout}
            styles={styles}
            textStyle={textStyle}
          >
            {content}
          </NoticeBarItem>
        </View>
      ) : null}
    </View>
  )
}

NoticeBarContent.displayName = 'NoticeBar.Content'
