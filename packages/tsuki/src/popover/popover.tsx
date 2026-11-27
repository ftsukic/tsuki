import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { LayoutChangeEvent, StyleProp, View as NativeView, ViewStyle } from 'react-native'
import { FloatingBubbleTransition } from '../floating/bubble-transition'
import type { FloatingScrollOffsetPair } from '../floating/scroll-scope'
import { FloatingTrigger } from '../floating/trigger'
import { useFloating } from '../floating/useFloating'
import type { FloatingArrowPosition, FloatingPosition } from '../floating/types'
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

const POPOVER_ARROW_SIZE = 10
const POPOVER_ARROW_PADDING = 10

function extractArrowSurfaceClasses(contentClassName?: string): string | undefined {
  if (!contentClassName) return undefined
  const tokens = contentClassName
    .split(/\s+/)
    .filter(
      (token) =>
        /^(?:bg-|border-)/.test(token) &&
        !/^border-(?:\d+|x|y|t|r|b|l|s|e|solid|dashed|dotted|double|hidden|none)(?:-|$)/.test(
          token,
        ),
    )
  return tokens.length ? tokens.join(' ') : undefined
}

function extractArrowSurfaceStyle(contentStyle?: StyleProp<ViewStyle>): ViewStyle | undefined {
  if (!contentStyle) return undefined
  const flattened = StyleSheet.flatten(contentStyle)
  if (!flattened) return undefined
  const style: ViewStyle = {}
  if (flattened.backgroundColor !== undefined) style.backgroundColor = flattened.backgroundColor
  if (flattened.borderColor !== undefined) style.borderColor = flattened.borderColor
  return style.backgroundColor !== undefined || style.borderColor !== undefined ? style : undefined
}

function resolveArrowStyle(arrow: FloatingArrowPosition): ViewStyle {
  const half = POPOVER_ARROW_SIZE / 2
  const base: ViewStyle = {
    position: 'absolute',
    width: POPOVER_ARROW_SIZE,
    height: POPOVER_ARROW_SIZE,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  }
  if (arrow.side === 'top') {
    return { ...base, top: -half, left: arrow.x, borderTopWidth: 1, borderLeftWidth: 1 }
  }
  if (arrow.side === 'bottom') {
    return { ...base, bottom: -half, left: arrow.x, borderBottomWidth: 1, borderRightWidth: 1 }
  }
  if (arrow.side === 'left') {
    return { ...base, left: -half, top: arrow.y, borderBottomWidth: 1, borderLeftWidth: 1 }
  }
  return { ...base, right: -half, top: arrow.y, borderTopWidth: 1, borderRightWidth: 1 }
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
  arrow = true,
  collisionPadding = 8,
  avoidCollisions = true,
  repositionKey,
  scrollBehavior = 'follow',
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
    arrowSize: POPOVER_ARROW_SIZE,
    arrowPadding: POPOVER_ARROW_PADDING,
    repositionKey,
    destination: 'root',
  })

  useEffect(() => {
    const scope = floating.scrollScope
    if (!isVisible || !scope) return
    if (scrollBehavior === 'dismiss') {
      return scope.subscribeScroll(handleClose)
    }
    return scope.subscribeScrollEnd(floating.reposition)
  }, [floating.reposition, floating.scrollScope, handleClose, isVisible, scrollBehavior])
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
    className: semanticClassName(classNames, 'root', 'self-start', className),
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
          anchorScrollOffset={floating.scrollOffset}
          arrow={arrow}
          classNames={classNames}
          content={content}
          contentRef={contentRef}
          followScroll={scrollBehavior === 'follow'}
          onContentLayout={floating.onContentLayout}
          position={floating.position}
          scrollOffsets={floating.scrollScope?.offsets}
          styles={styles}
        />
      </OverlayPortal>
    </>
  )
}

function PopoverBubble({
  anchorScrollOffset,
  arrow,
  classNames,
  content,
  contentRef,
  followScroll,
  onContentLayout,
  position,
  scrollOffsets,
  styles,
}: {
  anchorScrollOffset: { x: number; y: number }
  arrow: boolean
  classNames: PopoverProps['classNames']
  content: ReactNode
  contentRef: RefObject<NativeView | null>
  followScroll: boolean
  onContentLayout: (event: LayoutChangeEvent) => void
  position: FloatingPosition | null
  scrollOffsets?: ReadonlyArray<FloatingScrollOffsetPair>
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

  const arrowProps =
    arrow && position
      ? {
          accessibilityElementsHidden: true,
          accessible: false,
          importantForAccessibility: 'no-hide-descendants' as const,
          pointerEvents: 'none' as const,
          className: cn(
            'border-tsuki-border bg-tsuki-surface-elevated',
            extractArrowSurfaceClasses(classNames?.content),
            classNames?.arrow,
          ),
          style: [
            resolveArrowStyle(position.arrow),
            extractArrowSurfaceStyle(styles?.content),
            styles?.arrow,
          ],
          testID: 'tsuki-popover-arrow',
        }
      : null

  return (
    <FloatingBubbleTransition
      anchorScrollOffset={anchorScrollOffset}
      enterOffset={4}
      enterScale={0.92}
      exitOffset={3}
      exitScale={0.96}
      followScroll={followScroll}
      pointerEvents="box-none"
      position={position}
      scrollOffsets={scrollOffsets}
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
      {arrowProps ? createElement(View, arrowProps) : null}
    </FloatingBubbleTransition>
  )
}
