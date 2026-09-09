import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { Icon } from '../icon'
import { Animated, useAnimatedStyle } from '../motion'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { DropdownMenuContext, sameDropdownValue } from './context'
import { getDropdownItemStyles } from './style'
import { getDropdownToken } from './token'
import type { DropdownItemProps, DropdownItemRef, DropdownOption } from './types'

function renderText(value: React.ReactNode, style: Parameters<typeof Text>[0]['style']) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
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

  const { notifyItemUpdate, unregisterItem } = context
  const direction = context.direction
  const index = context.registerItem(idRef.current, disabled)
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
      selected: activeOption !== undefined,
    },
  })
  const resolvedStyles = getDropdownItemStyles(token, active, disabled)
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

  const activeRef = useRef(active)
  useEffect(() => {
    const previousActive = activeRef.current
    activeRef.current = active
    if (previousActive === active) return
    if (active) onOpen?.()
    else onClose?.()
  }, [active, onClose, onOpen])

  useEffect(() => {
    if (options && value === undefined) notifyItemUpdate()
  }, [internalValue, notifyItemUpdate, options, value])

  useEffect(() => {
    const id = idRef.current
    return () => unregisterItem(id)
  }, [unregisterItem])

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
    <View testID={`${testID ?? `dropdown-item-${index}`}-options`} style={resolvedStyles.content}>
      {options.map((option, optionIndex) => {
        const selected = sameDropdownValue(currentValue, option.value)
        return (
          <Pressable
            key={`${String(option.value)}-${optionIndex}`}
            testID={`dropdown-option-${index}-${optionIndex}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: option.disabled, selected }}
            disabled={option.disabled}
            onPress={() => handleOptionPress(option)}
            pressStyle="opacity"
            style={({ pressed }) => [
              resolvedStyles.option,
              itemSemantic?.option,
              option.disabled ? { opacity: 0.6 } : null,
              pressed ? { backgroundColor: themeToken.colorFillTertiary } : null,
            ]}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              {option.icon ? <View style={itemSemantic?.optionIcon}>{option.icon}</View> : null}
              {renderText(option.text, [
                resolvedStyles.optionText,
                itemSemantic?.optionText,
                selected ? { color: context.activeColor } : null,
              ])}
            </View>
            {selected ? (
              <Icon
                name="CheckOutlined"
                size={token.optionIconSize}
                color={context.activeColor}
                style={itemSemantic?.optionIcon}
              />
            ) : null}
          </Pressable>
        )
      })}
    </View>
  ) : null

  context.updateItem(idRef.current, {
    content,
    contentStyle: [itemSemantic?.content, contentStyle],
    estimatedHeight: children == null && options ? options.length * token.optionHeight : undefined,
    onClosed,
    onOpened,
    overlayStyle: itemSemantic?.overlay,
  })

  return (
    <Pressable
      {...viewProps}
      testID={testID ?? `dropdown-item-${index}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded: active }}
      disabled={disabled}
      onPress={toggle}
      pressStyle="opacity"
      style={({ pressed }) => [
        resolvedStyles.item,
        menuSemantic?.item,
        style,
        pressed && !disabled ? { backgroundColor: themeToken.colorFillTertiary } : null,
      ]}
    >
      {renderText(resolvedTitle, [resolvedStyles.title, menuSemantic?.title])}
      <Animated.View
        pointerEvents="none"
        style={[resolvedStyles.arrow, menuSemantic?.arrow, animatedArrowStyle]}
      >
        <Icon
          name="DownOutlined"
          size={token.arrowSize}
          color={disabled ? token.disabledColor : active ? context.activeColor : token.titleColor}
        />
      </Animated.View>
    </Pressable>
  )
})

DropdownItem.displayName = 'DropdownItem'
