import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { ScrollView, View } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { Icon } from '../icon'
import { Animated, useAnimatedStyle } from '../motion'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { DropdownItemPositionContext, DropdownMenuContext, sameDropdownValue } from './context'
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
  return options?.find((option) => sameDropdownValue(option.value, value))
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
    contentStyle,
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
  const menuSemantic = resolveStyles(context.menuStyles, {
    props: context.menuProps,
    state: { active, disabled, index },
  })
  const itemProps: DropdownItemProps = {
    children,
    closeOnSelect,
    contentStyle,
    defaultValue,
    disabled,
    onChange,
    options,
    style,
    styles,
    title,
    value,
  }
  const itemSemantic = resolveStyles(styles, {
    props: itemProps,
    state: {
      active,
      disabled,
      index,
    },
  })
  const resolvedStyles = getDropdownItemStyles(
    token,
    active,
    disabled,
    context.activeColor,
    context.scrollable,
    context.scrollableItemWidth,
  )
  const duration = themeToken.motion ? Math.max(0, context.duration ?? token.animationDuration) : 0
  const arrowProgress = useSharedValue(active ? 1 : 0)
  const animatedArrowStyle = useAnimatedStyle(() => {
    const progress = arrowProgress.value
    const base = direction === 'down' ? 0 : 180
    const delta = direction === 'down' ? 180 : -180
    return { transform: [{ rotate: `${base + delta * progress}deg` }] }
  })

  useEffect(() => {
    arrowProgress.value = withTiming(active ? 1 : 0, {
      duration,
    })
  }, [active, arrowProgress, duration])

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

  const handleOptionPress = (option: DropdownOption) => {
    if (option.disabled) return
    if (value === undefined && !sameDropdownValue(internalValue, option.value)) {
      setInternalValue(option.value)
    }
    onChange?.(option.value)
    if (closeOnSelect) context.close()
  }

  const resolvedTitle = title !== undefined ? title : activeOption?.text
  const hasCustomContent = children != null
  const content = hasCustomContent ? (
    children
  ) : options ? (
    <ScrollView
      testID={`${testID ?? `dropdown-item-${index}`}-options`}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={[
        resolvedStyles.content,
        context.panelMaxHeight ? { maxHeight: context.panelMaxHeight } : null,
      ]}
    >
      {options.map((option, optionIndex) => {
        const selected = sameDropdownValue(currentValue, option.value)
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
            pressStyle="none"
            style={({ pressed }) => [
              resolvedStyles.option,
              itemSemantic?.option,
              pressed && !option.disabled ? { backgroundColor: token.optionPressedColor } : null,
            ]}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              {option.icon ? (
                <View
                  style={[
                    resolvedStyles.optionIcon,
                    { marginRight: token.caretGap },
                    itemSemantic?.optionIcon,
                  ]}
                >
                  {option.icon}
                </View>
              ) : null}
              {renderText(
                option.text,
                [resolvedStyles.optionText, { color: optionTextColor }, itemSemantic?.optionText],
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
                  itemSemantic?.optionIcon,
                ]}
              />
            ) : null}
            {optionIndex < options.length - 1 ? (
              <View style={resolvedStyles.optionDivider} />
            ) : null}
          </Pressable>
        )
      })}
    </ScrollView>
  ) : null

  useEffect(() => {
    updateItem(idRef.current, {
      content,
      contentStyle: [itemSemantic?.content, contentStyle],
      estimatedHeight:
        children == null && options
          ? Math.min(options.length * token.optionHeight, context.panelMaxHeight ?? Infinity)
          : undefined,
      onClose,
      onClosed,
      onOpen,
      onOpened,
      overlayStyle: itemSemantic?.overlay,
      metadata: [
        title,
        value,
        defaultValue,
        currentValue,
        options,
        children,
        contentStyle,
        onChange,
        onClose,
        onClosed,
        onOpen,
        onOpened,
        context.panelMaxHeight,
      ],
    })
  }, [
    children,
    content,
    contentStyle,
    context.panelMaxHeight,
    currentValue,
    defaultValue,
    itemSemantic?.content,
    itemSemantic?.overlay,
    onChange,
    onClose,
    onClosed,
    onOpen,
    onOpened,
    options,
    title,
    token.optionHeight,
    updateItem,
    value,
  ])

  return (
    <Pressable
      {...viewProps}
      testID={testID ?? `dropdown-item-${index}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded: active }}
      disabled={disabled}
      onPress={toggle}
      pressStyle="none"
      style={() => [resolvedStyles.item, menuSemantic?.item, style]}
    >
      {renderText(
        resolvedTitle,
        [resolvedStyles.title, menuSemantic?.title],
        `dropdown-title-${index}`,
      )}
      <Animated.View
        testID={`dropdown-arrow-${index}`}
        pointerEvents="none"
        style={[resolvedStyles.arrow, menuSemantic?.arrow, animatedArrowStyle]}
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
