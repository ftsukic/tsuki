import NativePopover from 'react-native-popover-view'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Fragment, cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import type { PressableProps, View as NativeView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { getPopoverStyles, getPopoverThemeColors } from './style'
import { PopoverActionItem } from './popover-action'
import { getPopoverToken } from './token'
import type { PopoverAction, PopoverProps, PopoverSemanticStyles, PopoverStyleState } from './types'

type NativePopoverProps = ComponentProps<typeof NativePopover>

interface TriggerChildProps {
  onPress?: PressableProps['onPress']
  onLongPress?: PressableProps['onLongPress']
}

type PressHandler = NonNullable<PressableProps['onPress']>
type LongPressHandler = NonNullable<PressableProps['onLongPress']>

const LONG_PRESS_DELAY = 500

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

function renderContent(value: ReactNode): ReactNode {
  if (typeof value === 'string' || typeof value === 'number') return <Text>{value}</Text>
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
  return children.type !== View && children.type !== Fragment
}

export function Popover(props: PopoverProps) {
  const {
    children,
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
  const { token: themeToken } = useToken()
  const token = useComponentToken('Popover', getPopoverToken)
  const safeAreaInsets = useSafeAreaInsets()
  const isControlled = visible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const currentVisible = isControlled ? visible === true : internalVisible
  const sourceRef = useRef<NativeView>(null)
  const currentVisibleRef = useRef(currentVisible)
  const requestedVisibleRef = useRef<boolean | undefined>(undefined)
  const triggerOpenRef = useRef(false)
  const onVisibleChangeRef = useRef(onVisibleChange)
  const onClosedRef = useRef(onClosed)
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeCompletionReportedRef = useRef(false)

  currentVisibleRef.current = currentVisible
  onVisibleChangeRef.current = onVisibleChange
  onClosedRef.current = onClosed

  const setVisible = useCallback(
    (next: boolean) => {
      if (requestedVisibleRef.current === next) return

      requestedVisibleRef.current = next
      if (!isControlled) setInternalVisible(next)
      onVisibleChangeRef.current?.(next)
    },
    [isControlled],
  )

  const openPopover = useCallback(() => {
    if (disabled || currentVisibleRef.current || triggerOpenRef.current) return

    triggerOpenRef.current = true
    setVisible(true)
  }, [disabled, setVisible])

  const closePopover = useCallback(() => {
    if (!currentVisibleRef.current) return

    triggerOpenRef.current = false
    setVisible(false)
  }, [setVisible])

  const handleRequestClose = useCallback(() => {
    if (closeOnPressOutside) closePopover()
  }, [closeOnPressOutside, closePopover])

  const handleSelect = useCallback(
    (action: PopoverAction, index: number) => {
      try {
        onSelect?.(action, index)
      } finally {
        if (closeOnAction) closePopover()
      }
    },
    [closeOnAction, closePopover, onSelect],
  )

  useEffect(() => {
    requestedVisibleRef.current = undefined
    if (!currentVisible) triggerOpenRef.current = false
  }, [currentVisible])

  const clearLongPressTimeout = useCallback(() => {
    if (longPressTimeoutRef.current === null) return

    clearTimeout(longPressTimeoutRef.current)
    longPressTimeoutRef.current = null
  }, [])

  useEffect(() => clearLongPressTimeout, [clearLongPressTimeout])

  const handleChildTrigger = useCallback(() => {
    openPopover()
  }, [openPopover])

  const childProps = children.props as TriggerChildProps
  const mergeChildTrigger = trigger !== 'manual' && canMergeTriggerHandler(children)
  const wrapperTrigger = trigger !== 'manual' && !mergeChildTrigger
  const triggerChild = mergeChildTrigger
    ? trigger === 'press'
      ? cloneElement(children as ReactElement<TriggerChildProps>, {
          onPress: mergePressHandlers(childProps.onPress, handleChildTrigger),
        })
      : cloneElement(children as ReactElement<TriggerChildProps>, {
          onLongPress: mergeLongPressHandlers(childProps.onLongPress, handleChildTrigger),
        })
    : children

  const handleWrapperTouchStart = useCallback(() => {
    if (!wrapperTrigger || trigger !== 'longPress') return

    clearLongPressTimeout()
    longPressTimeoutRef.current = setTimeout(() => {
      longPressTimeoutRef.current = null
      openPopover()
    }, LONG_PRESS_DELAY)
  }, [clearLongPressTimeout, openPopover, trigger, wrapperTrigger])

  const handleWrapperTouchEnd = useCallback(() => {
    clearLongPressTimeout()
    if (wrapperTrigger && trigger === 'press') openPopover()
  }, [clearLongPressTimeout, openPopover, trigger, wrapperTrigger])

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
  const animationDuration = themeToken.motion ? normalizedDuration : 0
  const contentStyle = [resolved.content, semantic?.content]
  const popoverStyle = [resolved.popover, semantic?.content, style]
  const actionsStyle = [
    resolved.actions,
    actionsDirection === 'horizontal' ? { width: token.actionWidth * actions.length } : null,
    semantic?.actions,
  ]
  const { disabledColor, textColor } = getPopoverThemeColors(token, theme)

  const clearCloseCompleteTimeout = useCallback(() => {
    if (closeCompleteTimeoutRef.current === null) return

    clearTimeout(closeCompleteTimeoutRef.current)
    closeCompleteTimeoutRef.current = null
  }, [])

  const finishClose = useCallback(() => {
    if (closeCompletionReportedRef.current) return

    closeCompletionReportedRef.current = true
    clearCloseCompleteTimeout()
    onClosedRef.current?.()
  }, [clearCloseCompleteTimeout])

  const handleNativeCloseStart = useCallback(() => {
    closeCompletionReportedRef.current = false
    try {
      onClose?.()
    } finally {
      clearCloseCompleteTimeout()
      if (onClosedRef.current) {
        // react-native-popover-view@6.1.0's default RN_MODAL path does not
        // forward onCloseComplete. Keep the public lifecycle contract by
        // completing after the configured animation and the modal handoff.
        closeCompleteTimeoutRef.current = setTimeout(finishClose, animationDuration + 50)
      }
    }
  }, [animationDuration, clearCloseCompleteTimeout, finishClose, onClose])

  useEffect(() => clearCloseCompleteTimeout, [clearCloseCompleteTimeout])

  const wrapperTouchProps = wrapperTrigger
    ? {
        onTouchCancel: clearLongPressTimeout,
        onTouchEnd: handleWrapperTouchEnd,
        onTouchMove: trigger === 'longPress' ? clearLongPressTimeout : undefined,
        onTouchStart: trigger === 'longPress' ? handleWrapperTouchStart : undefined,
      }
    : {}

  const popupContent = (
    <View testID="popover-content" style={contentStyle}>
      {content !== undefined ? (
        renderContent(content)
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
      <View
        ref={sourceRef}
        collapsable={false}
        renderToHardwareTextureAndroid
        style={semantic?.reference}
        testID="popover-reference"
        {...wrapperTouchProps}
      >
        {triggerChild}
      </View>
      <NativePopover
        animationConfig={{ duration: animationDuration }}
        arrowSize={{
          height: showArrow ? token.arrowHeight : 0,
          width: showArrow ? token.arrowWidth : 0,
        }}
        backgroundStyle={{ backgroundColor: overlay ? token.overlayColor : 'transparent' }}
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
        {popupContent}
      </NativePopover>
    </>
  )
}

Popover.displayName = 'Popover'
