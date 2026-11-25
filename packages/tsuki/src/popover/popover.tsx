import { createElement, useCallback, useMemo, useRef, useState } from 'react'
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
import type { PopoverProps } from './types'

const POPOVER_TRANSITION: OverlayTransitionConfig = {
  content: {
    preset: 'scale-fade',
    enter: { duration: 160, easing: MOTION_EASING.standard },
    exit: { duration: 120, easing: MOTION_EASING.accelerate },
  },
}

export function Popover({
  children,
  content,
  visible,
  defaultVisible = false,
  onVisibleChange,
  afterOpen,
  afterClose,
  closeOnBack = true,
  initialFocusRef,
  returnFocusRef,
  placement = 'bottom',
  offset = 8,
  collisionPadding = 8,
  avoidCollisions = true,
  repositionKey,
  asChild = false,
  closeOnPressOutside = true,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  className,
  classNames,
  style,
  styles,
  testID,
}: PopoverProps) {
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
  const handleToggle = useCallback(() => requestVisible(!isVisible), [isVisible, requestVisible])
  const handleExited = useCallback(() => {
    setOverlayMounted(false)
    afterClose?.()
  }, [afterClose])

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
      testID="tsuki-popover-outside"
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
          accessibilityHint={
            accessibilityHint ?? 'Opens a popover. Tap outside or press Back to close.'
          }
          accessibilityLabel={accessibilityLabel}
          asChild={asChild}
          disabled={disabled}
          expanded={isVisible}
          onPress={handleToggle}
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
        transition={POPOVER_TRANSITION}
        visible={isVisible}
      >
        <PopoverBubble
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

function PopoverBubble({
  classNames,
  content,
  contentRef,
  onContentLayout,
  position,
  styles,
}: {
  classNames: PopoverProps['classNames']
  content: ReactNode
  contentRef: RefObject<NativeView | null>
  onContentLayout: (event: LayoutChangeEvent) => void
  position: FloatingPosition | null
  styles: PopoverProps['styles']
}) {
  const bubbleProps = {
    accessibilityElementsHidden: !position,
    accessible: false,
    importantForAccessibility: position ? ('auto' as const) : ('no-hide-descendants' as const),
    onLayout: onContentLayout,
    pointerEvents: position ? ('box-none' as const) : ('none' as const),
    ref: contentRef,
    role: 'none' as const,
    className: cn(
      'max-w-full overflow-hidden rounded-lg border border-tsuki-border bg-tsuki-surface-elevated p-3 shadow-md',
      classNames?.content,
    ),
    style: styles?.content,
    testID: 'tsuki-popover-content',
  }

  return (
    <FloatingBubbleTransition
      enterOffset={4}
      enterScale={0.92}
      exitOffset={3}
      exitScale={0.96}
      pointerEvents="box-none"
      position={position}
      testID="tsuki-popover-positioner"
    >
      {createElement(
        View,
        bubbleProps,
        typeof content === 'string' || typeof content === 'number'
          ? createElement(
              Text,
              {
                className: cn('text-tsuki-foreground', classNames?.text),
                style: styles?.text,
              },
              content,
            )
          : content,
      )}
    </FloatingBubbleTransition>
  )
}
