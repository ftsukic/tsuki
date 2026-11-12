import { SwipeCellPressContext } from '../swipe-cell/context'
import { useMotionConfig } from '../motion/useMotionConfig'
import NativePopover from 'react-native-popover-view'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Fragment, cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Pressable as NativePressable,
  Text as NativeText,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Button } from '../button'
import { Pressable } from '../pressable'
import { PlainPressable } from '../pressable/plain-pressable'
import type { PressableProps, View as NativeView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getPopoverStyles, getPopoverThemeColors } from './style'
import { PopoverActionItem } from './popover-action'
import { getPopoverToken } from './token'
import type { PopoverAction, PopoverProps, PopoverSemanticStyles, PopoverStyleState } from './types'

type NativePopoverProps = ComponentProps<typeof NativePopover>

type TriggerChildProps = Pick<
  PressableProps,
  | 'onPress'
  | 'onLongPress'
  | 'disabled'
  | 'accessible'
  | 'accessibilityLabel'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'accessibilityActions'
  | 'onAccessibilityTap'
  | 'onAccessibilityAction'
>

type PressHandler = NonNullable<PressableProps['onPress']>
type LongPressHandler = NonNullable<PressableProps['onLongPress']>

function mergePressHandlers(original: PressableProps['onPress'], next: PressHandler): PressHandler {
  return (event) => {
    try {
      original?.(event)
    } finally {
      next(event)
    }
  }
}

function mergeLongPressHandlers(
  original: PressableProps['onLongPress'],
  next: LongPressHandler,
): LongPressHandler {
  return (event) => {
    try {
      original?.(event)
    } finally {
      next(event)
    }
  }
}

function renderContent(value: ReactNode, style: PopoverSemanticStyles['content']): ReactNode {
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return value
}

function getDisplayAreaInsets(
  safeAreaInsets: ReturnType<typeof useSafeAreaInsets>,
  screenMargin: number,
): NonNullable<NativePopoverProps['displayAreaInsets']> {
  return {
    bottom: Math.max(0, safeAreaInsets.bottom) + screenMargin,
    left: Math.max(0, safeAreaInsets.left) + screenMargin,
    right: Math.max(0, safeAreaInsets.right) + screenMargin,
    top: Math.max(0, safeAreaInsets.top) + screenMargin,
  }
}

function canMergeTriggerHandler(children: ReactElement): boolean {
  const props = children.props as TriggerChildProps
  return (
    [
      Button,
      Pressable,
      NativePressable,
      Text,
      NativeText,
      TouchableHighlight,
      TouchableOpacity,
      TouchableWithoutFeedback,
    ].some((type) => children.type === type) ||
    typeof props.onPress === 'function' ||
    typeof props.onLongPress === 'function'
  )
}

export function Popover(props: PopoverProps) {
  const {
    children,
    accessibilityLabel,
    actions = [],
    content,
    visible,
    defaultVisible = false,
    trigger = 'press',
    placement = 'bottom',
    theme = 'light',
    actionsDirection = 'vertical',
    disabled = false,
    offset,
    showArrow = true,
    overlay = false,
    closeOnAction = true,
    closeOnPressOutside = true,
    duration,
    style,
    styles,
    onSelect,
    onVisibleChange,
    onOpen,
    onOpened,
    onClose,
    onClosed,
  } = props
  const motion = useMotionConfig()
  const token = useComponentToken('Popover', getPopoverToken)
  const safeAreaInsets = useSafeAreaInsets()
  const isControlled = visible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const currentVisible = isControlled ? visible === true : internalVisible
  const childProps = children.props as TriggerChildProps
  const sourceRef = useRef<NativeView>(null)
  const setSourceRef = useCallback((node: NativeView | null) => {
    sourceRef.current = node
  }, [])
  const currentVisibleRef = useRef(currentVisible)
  const onVisibleChangeRef = useRef(onVisibleChange)
  const onClosedRef = useRef(onClosed)
  const closeSession = useMemo(
    () => ({ visible: currentVisible, closing: false }),
    [currentVisible],
  )
  const closeSessionRef = useRef(closeSession)

  currentVisibleRef.current = currentVisible
  onVisibleChangeRef.current = onVisibleChange
  onClosedRef.current = onClosed
  closeSessionRef.current = closeSession

  const setVisible = useCallback(
    (next: boolean) => {
      if (currentVisibleRef.current === next) return

      if (!isControlled) {
        currentVisibleRef.current = next
        setInternalVisible(next)
      }
      onVisibleChangeRef.current?.(next)
    },
    [isControlled],
  )

  const openPopover = useCallback(() => {
    if (
      disabled ||
      childProps.disabled ||
      childProps.accessibilityState?.disabled ||
      currentVisibleRef.current
    )
      return
    setVisible(true)
  }, [childProps.disabled, childProps.accessibilityState?.disabled, disabled, setVisible])

  const closePopover = useCallback(() => {
    if (!currentVisibleRef.current) return

    setVisible(false)
  }, [setVisible])

  const handleRequestClose = useCallback(() => {
    if (closeOnPressOutside) closePopover()
  }, [closeOnPressOutside, closePopover])

  const handleSelect = useCallback(
    (action: PopoverAction, index: number) => {
      if (!currentVisibleRef.current) return

      try {
        onSelect?.(action, index)
      } finally {
        if (closeOnAction) closePopover()
      }
    },
    [closeOnAction, closePopover, onSelect],
  )

  useEffect(
    () => () => {
      closeSession.closing = false
    },
    [closeSession],
  )

  const mergeChildTrigger = trigger !== 'manual' && canMergeTriggerHandler(children)
  const wrapperTrigger = trigger !== 'manual' && !mergeChildTrigger
  const triggerAccessibility = {
    accessible: childProps.accessible ?? true,
    accessibilityLabel: accessibilityLabel ?? childProps.accessibilityLabel,
    accessibilityRole: childProps.accessibilityRole ?? ('button' as const),
    accessibilityState: {
      ...childProps.accessibilityState,
      disabled: disabled || childProps.disabled || childProps.accessibilityState?.disabled || false,
      expanded: currentVisible,
    },
    accessibilityActions: childProps.accessibilityActions?.some(
      (action) => action.name === 'activate',
    )
      ? childProps.accessibilityActions
      : [...(childProps.accessibilityActions ?? []), { name: 'activate' as const }],
    onAccessibilityTap: () => {
      try {
        childProps.onAccessibilityTap?.()
      } finally {
        openPopover()
      }
    },
    onAccessibilityAction: (
      event: Parameters<NonNullable<PressableProps['onAccessibilityAction']>>[0],
    ) => {
      try {
        childProps.onAccessibilityAction?.(event)
      } finally {
        if (event.nativeEvent.actionName === 'activate') openPopover()
      }
    },
  }
  const triggerChild = mergeChildTrigger
    ? cloneElement(children as ReactElement<TriggerChildProps>, {
        ...triggerAccessibility,
        ...(trigger === 'press'
          ? { onPress: mergePressHandlers(childProps.onPress, openPopover) }
          : { onLongPress: mergeLongPressHandlers(childProps.onLongPress, openPopover) }),
      })
    : children

  const semantic = resolveStyles<PopoverProps, PopoverStyleState, PopoverSemanticStyles>(styles, {
    props,
    state: { actionsDirection, placement, theme, visible: currentVisible },
  })
  const resolved = useMemo(
    () => getPopoverStyles(token, theme, actionsDirection),
    [actionsDirection, theme, token],
  )
  const safeAreaDisplayInsets = useMemo(
    () => getDisplayAreaInsets(safeAreaInsets, token.screenMargin),
    [safeAreaInsets, token.screenMargin],
  )
  const normalizedOffset = Number.isFinite(offset) ? Math.max(0, offset as number) : token.offset
  const requestedDuration = duration === undefined ? token.animationDuration : duration
  const normalizedDuration = Number.isFinite(requestedDuration)
    ? Math.max(0, requestedDuration as number)
    : token.animationDuration
  const animationDuration = motion.duration(normalizedDuration)
  const popoverStyle = [resolved.popover, semantic?.root, style]
  const actionsStyle = [resolved.actions, semantic?.list]
  const { disabledColor, textColor } = getPopoverThemeColors(token, theme)

  const finishClose = useCallback(() => {
    if (
      currentVisibleRef.current ||
      closeSessionRef.current !== closeSession ||
      !closeSession.closing
    )
      return

    closeSession.closing = false
    onClosedRef.current?.()
  }, [closeSession])

  const handleNativeCloseStart = useCallback(() => {
    if (closeSession.visible || closeSessionRef.current !== closeSession) return

    closeSession.closing = true
    onClose?.()
  }, [closeSession, onClose])

  const Reference = wrapperTrigger ? PlainPressable : View
  const referenceProps = wrapperTrigger
    ? {
        ...triggerAccessibility,
        disabled: triggerAccessibility.accessibilityState.disabled,
        onPress: trigger === 'press' ? openPopover : undefined,
        onLongPress: trigger === 'longPress' ? openPopover : undefined,
      }
    : {}

  const popupContent = (
    <View
      testID="popover-content"
      style={semantic?.container}
      pointerEvents={currentVisible ? 'auto' : 'none'}
      accessibilityElementsHidden={!currentVisible}
      importantForAccessibility={currentVisible ? 'auto' : 'no-hide-descendants'}
    >
      {content !== undefined ? (
        renderContent(content, semantic?.content)
      ) : (
        <View testID="popover-actions" style={actionsStyle}>
          {actions.map((action, index) => (
            <Fragment key={index}>
              {index > 0 ? (
                <View
                  testID={`popover-divider-${index - 1}`}
                  style={[resolved.divider, semantic?.divider]}
                />
              ) : null}
              <PopoverActionItem
                action={action}
                disabledColor={disabledColor}
                index={index}
                onSelect={handleSelect}
                semantic={semantic}
                styles={resolved}
                textColor={textColor}
                theme={theme}
                token={token}
              />
            </Fragment>
          ))}
        </View>
      )}
    </View>
  )

  return (
    <>
      <Reference
        ref={setSourceRef}
        collapsable={false}
        renderToHardwareTextureAndroid
        style={semantic?.reference}
        testID="popover-reference"
        {...referenceProps}
      >
        {triggerChild}
      </Reference>
      <NativePopover
        animationConfig={{ duration: animationDuration }}
        arrowSize={{
          height: showArrow ? token.arrowHeight : 0,
          width: showArrow ? token.arrowWidth : 0,
        }}
        backgroundStyle={[
          { backgroundColor: overlay ? token.overlayColor : 'transparent' },
          semantic?.mask,
        ]}
        displayAreaInsets={safeAreaDisplayInsets}
        from={sourceRef as unknown as NativePopoverProps['from']}
        isVisible={currentVisible}
        offset={normalizedOffset}
        onCloseComplete={finishClose}
        onCloseStart={handleNativeCloseStart}
        onOpenComplete={onOpened}
        onOpenStart={onOpen}
        onRequestClose={handleRequestClose}
        placement={placement as unknown as NativePopoverProps['placement']}
        popoverStyle={popoverStyle}
      >
        <SwipeCellPressContext.Provider value={null}>{popupContent}</SwipeCellPressContext.Provider>
      </NativePopover>
    </>
  )
}

Popover.displayName = 'Popover'
