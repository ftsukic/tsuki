import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { LayoutChangeEvent, View as NativeView } from 'react-native'
import { FloatingBubbleTransition } from '../floating/bubble-transition'
import { FloatingTrigger } from '../floating/trigger'
import { useFloating } from '../floating/useFloating'
import type { FloatingPosition } from '../floating/types'
import { MOTION_EASING } from '../motion/easing'
import { OverlayPortal } from '../overlay/overlay-portal'
import type { OverlayTransitionConfig } from '../overlay/transition/types'
import { cn } from '../style/cn'
import { semanticClassName } from '../style/semantic'
import { Text } from '../text'
import type { TooltipProps } from './types'

const TOOLTIP_TRANSITION: OverlayTransitionConfig = {
  content: {
    preset: 'scale-fade',
    enter: { duration: 140, easing: MOTION_EASING.standard },
    exit: { duration: 100, easing: MOTION_EASING.accelerate },
  },
}

export function Tooltip({
  children,
  content,
  trigger = 'long-press',
  visible,
  defaultVisible = false,
  onVisibleChange,
  afterOpen,
  afterClose,
  closeOnBack = true,
  closeOnPressOutside = false,
  autoCloseDuration,
  disabled = false,
  asChild = false,
  initialFocusRef,
  returnFocusRef,
  placement = 'top',
  offset = 8,
  collisionPadding = 8,
  avoidCollisions = true,
  repositionKey,
  accessibilityLabel,
  accessibilityHint,
  className,
  classNames,
  style,
  styles,
  testID,
}: TooltipProps) {
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible)
  const isControlled = visible !== undefined
  const isVisible = isControlled ? visible : uncontrolledVisible
  const [overlayMounted, setOverlayMounted] = useState(isVisible)
  if (isVisible && !overlayMounted) setOverlayMounted(true)
  const anchorRef = useRef<NativeView>(null)
  const contentRef = useRef<NativeView>(null)

  const requestVisible = useCallback(
    (nextVisible: boolean) => {
      if (nextVisible === isVisible) return
      if (!isControlled) setUncontrolledVisible(nextVisible)
      onVisibleChange?.(nextVisible)
    },
    [isControlled, isVisible, onVisibleChange],
  )
  const handleClose = useCallback(() => requestVisible(false), [requestVisible])
  const toggleVisible = useCallback(() => requestVisible(!isVisible), [isVisible, requestVisible])
  const handleExited = useCallback(() => {
    setOverlayMounted(false)
    afterClose?.()
  }, [afterClose])

  useEffect(() => {
    if (!isVisible || !autoCloseDuration || autoCloseDuration <= 0) return
    const timer = setTimeout(() => requestVisible(false), autoCloseDuration)
    return () => clearTimeout(timer)
  }, [autoCloseDuration, isVisible, requestVisible])

  const textContent =
    typeof content === 'string' || typeof content === 'number' ? String(content) : undefined
  const triggerHint =
    accessibilityHint ??
    (trigger === 'long-press' ? 'Long press to show hint.' : 'Tap to toggle hint.')
  const floating = useFloating({
    anchorRef,
    enabled: isVisible,
    mounted: overlayMounted,
    placement,
    offset,
    collisionPadding,
    avoidCollisions,
    repositionKey,
    destination: 'root',
  })
  const accessibility = useMemo(
    () => ({ mode: 'non-modal' as const, initialFocusRef, returnFocusRef }),
    [initialFocusRef, returnFocusRef],
  )
  const outsideMask = closeOnPressOutside ? (
    <Pressable
      accessibilityElementsHidden
      accessible={false}
      onPress={handleClose}
      pointerEvents="auto"
      style={StyleSheet.absoluteFill}
      testID="tsuki-tooltip-outside"
    />
  ) : undefined
  const anchorProps = {
    className: semanticClassName(classNames, 'root', undefined, className),
    collapsable: false,
    onLayout: floating.onAnchorLayout,
    onTouchMove: floating.onAnchorTouchMove,
    ref: anchorRef,
    style: [styles?.root, style],
    testID,
  }

  return (
    <>
      {createElement(
        View,
        anchorProps,
        <FloatingTrigger
          accessibilityActions={[
            { name: 'activate', label: isVisible ? 'Hide hint' : 'Show hint' },
          ]}
          accessibilityHint={triggerHint}
          accessibilityLabel={accessibilityLabel}
          asChild={asChild}
          delayLongPress={500}
          disabled={disabled}
          expanded={isVisible}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'activate') toggleVisible()
          }}
          onAccessibilityTap={toggleVisible}
          onLongPress={trigger === 'long-press' ? toggleVisible : undefined}
          onPress={trigger === 'press' || isVisible ? toggleVisible : undefined}
        >
          {children}
        </FloatingTrigger>,
      )}
      <OverlayPortal
        accessibility={accessibility}
        backBehavior={closeOnBack ? 'dismiss' : 'consume'}
        mask={outsideMask}
        onBack={closeOnBack ? handleClose : undefined}
        onEntered={afterOpen}
        onExited={handleExited}
        ready={floating.position !== null}
        transition={TOOLTIP_TRANSITION}
        visible={isVisible}
      >
        <TooltipBubble
          accessibilityLabel={textContent}
          classNames={classNames}
          content={content}
          contentRef={contentRef}
          onContentLayout={floating.onContentLayout}
          position={floating.position}
          styles={styles}
        />
      </OverlayPortal>
    </>
  )
}

function TooltipBubble({
  accessibilityLabel,
  classNames,
  contentRef,
  content,
  onContentLayout,
  position,
  styles,
}: {
  accessibilityLabel?: string
  classNames: TooltipProps['classNames']
  contentRef: RefObject<NativeView | null>
  content: ReactNode
  onContentLayout: (event: LayoutChangeEvent) => void
  position: FloatingPosition | null
  styles: TooltipProps['styles']
}) {
  const simpleContent = typeof content === 'string' || typeof content === 'number'

  const bubbleProps = {
    accessibilityElementsHidden: !position,
    accessibilityLabel,
    accessibilityLiveRegion: 'polite' as const,
    accessible: simpleContent,
    importantForAccessibility: position ? ('yes' as const) : ('no-hide-descendants' as const),
    onLayout: onContentLayout,
    pointerEvents: 'none' as const,
    ref: contentRef,
    role: 'tooltip' as const,
    className: cn(
      'max-w-[280px] overflow-hidden rounded-lg bg-tsuki-foreground px-3 py-2 shadow-sm',
      classNames?.content,
    ),
    style: styles?.content,
    testID: 'tsuki-tooltip-content',
  }

  return (
    <FloatingBubbleTransition
      enterOffset={4}
      enterScale={0.94}
      exitOffset={3}
      exitScale={0.97}
      pointerEvents="none"
      position={position}
      testID="tsuki-tooltip-positioner"
    >
      {createElement(
        View,
        bubbleProps,
        simpleContent
          ? createElement(
              Text,
              {
                className: cn('text-xs text-tsuki-background', classNames?.text),
                style: styles?.text,
              },
              content,
            )
          : content,
      )}
    </FloatingBubbleTransition>
  )
}
