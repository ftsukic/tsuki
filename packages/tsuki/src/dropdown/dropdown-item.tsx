import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AccessibilityInfo, findNodeHandle, Platform, ScrollView, View } from 'react-native'
import { useMotionValue } from '../motion/useMotionValue'
import { LAYOUT_PRESET } from '../motion/presets'
import { Icon } from '../icon'
import { Animated, useAnimatedStyle } from '../motion'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { DropdownItemPositionContext, DropdownMenuContext } from './context'
import { getDropdownItemStyles } from './style'
import { getDropdownToken } from './token'
import type { DropdownItemProps, DropdownItemRef, DropdownOption } from './types'

function renderText(
  value: React.ReactNode,
  style: Parameters<typeof Text>[0]['style'],
  testID?: string,
) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text testID={testID} style={style}>
        {value}
      </Text>
    )
  }
  return value
}

function findOption(options: DropdownOption[] | undefined, value: DropdownItemProps['value']) {
  return options?.find((option) => Object.is(option.value, value))
}

export const DropdownItem = forwardRef<DropdownItemRef, DropdownItemProps>(function DropdownItem(
  {
    title,
    value,
    defaultValue,
    options,
    disabled = false,
    children,
    onChange,
    onOpen,
    onOpened,
    onClose,
    onClosed,
    closeOnSelect = true,
    style,
    styles,
    testID,
    ...viewProps
  },
  ref,
) {
  const context = useContext(DropdownMenuContext)
  const { token: themeToken } = useToken()
  const token = useComponentToken('Dropdown', getDropdownToken)
  const idRef = useRef(Symbol('dropdown-item'))
  const triggerRef = useRef<View>(null)
  const restoreFocus = useCallback(() => {
    if (Platform.OS === 'web') {
      ;(triggerRef.current as unknown as { focus?: () => void } | null)?.focus?.()
    } else {
      const handle = findNodeHandle(triggerRef.current)
      if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle)
    }
  }, [])
  const [internalValue, setInternalValue] = useState(defaultValue)

  if (!context) {
    throw new Error('DropdownItem must be used inside DropdownMenu')
  }

  const { notifyItemUpdate, registerItem, unregisterItem, updateItem } = context
  const direction = context.direction
  const position = useContext(DropdownItemPositionContext)
  const index = position ?? 0
  const currentValue = value === undefined ? internalValue : value
  const active = context.activeIndex === index
  const activeOption = findOption(options, currentValue)
  const menuSemantic = useMemo(
    () =>
      resolveStyles(context.menuStyles, {
        props: context.menuProps,
        state: { active, disabled, index },
      }),
    [context.menuStyles, context.menuProps, active, disabled, index],
  )
  const itemProps = useMemo<DropdownItemProps>(
    () => ({
      children,
      closeOnSelect,
      defaultValue,
      disabled,
      onChange,
      options,
      style,
      styles,
      title,
      value,
      onOpen,
      onOpened,
      onClose,
      onClosed,
      testID,
    }),
    [
      children,
      closeOnSelect,
      defaultValue,
      disabled,
      onChange,
      options,
      style,
      styles,
      title,
      value,
      onOpen,
      onOpened,
      onClose,
      onClosed,
      testID,
    ],
  )
  const itemSemantic = useMemo(
    () =>
      resolveStyles(styles, {
        props: itemProps,
        state: {
          active,
          disabled,
          index,
        },
      }),
    [styles, itemProps, active, disabled, index],
  )
  const resolvedStyles = useMemo(
    () =>
      getDropdownItemStyles(
        token,
        active,
        disabled,
        context.activeColor,
        context.scrollable,
        context.scrollableItemWidth,
      ),
    [token, active, disabled, context.activeColor, context.scrollable, context.scrollableItemWidth],
  )
  const duration = themeToken.motion ? Math.max(0, context.duration ?? token.animationDuration) : 0
  const arrowProgress = useMotionValue(
    active ? 1 : 0,
    { ...LAYOUT_PRESET, duration },
    active ? 1 : 0,
  )
  const animatedArrowStyle = useAnimatedStyle(() => {
    const progress = arrowProgress.value
    const base = direction === 'down' ? 0 : 180
    const delta = direction === 'down' ? 180 : -180
    return { transform: [{ rotate: `${base + delta * progress}deg` }] }
  })

  useLayoutEffect(() => {
    registerItem(idRef.current, index, disabled)
  }, [disabled, index, registerItem, unregisterItem])

  useEffect(() => () => unregisterItem(idRef.current), [unregisterItem])

  useLayoutEffect(() => {
    if (options && value === undefined) notifyItemUpdate()
  }, [internalValue, notifyItemUpdate, options, value])

  const open = useCallback(() => context.open(index), [context, index])
  const close = useCallback(() => context.close(), [context])
  const toggle = useCallback(() => context.toggle(index), [context, index])

  useImperativeHandle(ref, () => ({ open, close, toggle }), [close, open, toggle])

  const closeMenu = context.close
  const handleOptionPress = useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return
      if (value === undefined && !Object.is(internalValue, option.value)) {
        setInternalValue(option.value)
      }
      onChange?.(option.value)
      if (closeOnSelect) closeMenu()
    },
    [value, internalValue, onChange, closeOnSelect, closeMenu],
  )

  const resolvedTitle = title !== undefined ? title : activeOption?.text
  const hasCustomContent = children != null
  const content = useMemo(
    () =>
      hasCustomContent ? (
        children
      ) : options ? (
        <ScrollView
          testID={`${testID ?? `dropdown-item-${index}`}-options`}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={[
            resolvedStyles.content,
            itemSemantic?.popup?.list,
            context.panelMaxHeight ? { maxHeight: context.panelMaxHeight } : null,
          ]}
        >
          {options.map((option, optionIndex) => {
            const selected = Object.is(currentValue, option.value)
            const optionTextColor = option.disabled
              ? token.optionDisabledColor
              : selected
                ? context.activeColor
                : token.optionTextColor
            return (
              <Pressable
                key={`${String(option.value)}-${optionIndex}`}
                testID={`dropdown-option-${index}-${optionIndex}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: option.disabled, selected }}
                disabled={option.disabled}
                onPress={() => handleOptionPress(option)}
                pressStyle="background"
                pressedBackgroundColor={token.optionPressedBackgroundColor}
                style={[resolvedStyles.option, itemSemantic?.popup?.listItem]}
              >
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  {option.icon ? (
                    <View
                      style={[
                        resolvedStyles.optionIcon,
                        { marginRight: token.caretGap },
                        itemSemantic?.popup?.listItemIcon,
                      ]}
                    >
                      {option.icon}
                    </View>
                  ) : null}
                  {renderText(
                    option.text,
                    [
                      resolvedStyles.optionText,
                      { color: optionTextColor },
                      itemSemantic?.popup?.listItemLabel,
                    ],
                    `dropdown-option-${index}-${optionIndex}-text`,
                  )}
                </View>
                {selected ? (
                  <Icon
                    name="CheckOutlined"
                    size={token.optionIconSize}
                    color={option.disabled ? token.optionDisabledColor : context.activeColor}
                    testID={`dropdown-option-${index}-${optionIndex}-check`}
                    style={[
                      resolvedStyles.optionIcon,
                      { marginLeft: token.caretGap },
                      itemSemantic?.popup?.listItemIcon,
                      itemSemantic?.popup?.listItemSelectedIcon,
                    ]}
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  />
                ) : null}
                {optionIndex < options.length - 1 ? (
                  <View style={resolvedStyles.optionDivider} />
                ) : null}
              </Pressable>
            )
          })}
        </ScrollView>
      ) : null,
    [
      hasCustomContent,
      children,
      options,
      testID,
      index,
      resolvedStyles,
      itemSemantic,
      context.panelMaxHeight,
      currentValue,
      token,
      context.activeColor,
      handleOptionPress,
    ],
  )

  useEffect(() => {
    updateItem(idRef.current, {
      content,
      restoreFocus,
      contentStyle: itemSemantic?.popup?.root,
      estimatedHeight:
        children == null && options
          ? Math.min(options.length * token.optionHeight, context.panelMaxHeight ?? Infinity)
          : undefined,
      onClose,
      onClosed,
      onOpen,
      onOpened,
      overlayStyle: itemSemantic?.popup?.mask,
      metadata: [
        title,
        value,
        defaultValue,
        currentValue,
        options,
        children,
        onChange,
        onClose,
        onClosed,
        onOpen,
        onOpened,
        context.panelMaxHeight,
        styles,
        context.menuStyles,
        context.activeColor,
        token,
        active,
        disabled,
        index,
        closeOnSelect,
      ],
    })
  }, [
    children,
    content,
    context.panelMaxHeight,
    currentValue,
    defaultValue,
    itemSemantic?.popup?.root,
    itemSemantic?.popup?.mask,
    onChange,
    onClose,
    onClosed,
    onOpen,
    onOpened,
    options,
    title,
    token,
    styles,
    context.menuStyles,
    context.activeColor,
    active,
    disabled,
    index,
    closeOnSelect,
    updateItem,
    restoreFocus,
    value,
  ])

  return (
    <Pressable
      ref={(node) => {
        triggerRef.current = node
      }}
      {...viewProps}
      testID={testID ?? `dropdown-item-${index}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded: active }}
      disabled={disabled}
      onPress={toggle}
      pressStyle="none"
      style={() => [resolvedStyles.item, menuSemantic?.item, itemSemantic?.root, style]}
    >
      {renderText(
        resolvedTitle,
        [resolvedStyles.title, menuSemantic?.title, itemSemantic?.title],
        `dropdown-title-${index}`,
      )}
      <Animated.View
        testID={`dropdown-arrow-${index}`}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[resolvedStyles.arrow, menuSemantic?.arrow, itemSemantic?.arrow, animatedArrowStyle]}
      >
        <View
          testID={`dropdown-caret-${index}`}
          style={{
            borderLeftColor: 'transparent',
            borderLeftWidth: token.caretSize,
            borderRightColor: 'transparent',
            borderRightWidth: token.caretSize,
            borderTopColor: disabled
              ? token.disabledColor
              : active
                ? context.activeColor
                : token.titleColor,
            borderTopWidth: token.caretSize,
            height: 0,
            width: 0,
          }}
        />
      </Animated.View>
    </Pressable>
  )
})

DropdownItem.displayName = 'DropdownItem'
