import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useMotionValue } from '../motion/useMotionValue'
import { LAYOUT_PRESET } from '../motion/presets'
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { LayoutChangeEvent, StyleProp, TextStyle, View as ViewComponent } from 'react-native'
import { getButtonToken } from '../button/token'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import type {
  SegmentedOption,
  SegmentedOptionInput,
  SegmentedProps,
  SegmentedSize,
  SegmentedStyleState,
} from './types'
import { getSegmentedStyles } from './style'
import { getSegmentedToken } from './token'

interface OptionLayout {
  width: number
  x: number
}

function normalizeOption(option: SegmentedOptionInput): SegmentedOption {
  return typeof option === 'string' ? { label: option, value: option } : option
}

function getButtonSize(size: SegmentedSize) {
  return size === 'middle' ? 'normal' : size
}

function getOptionSizeStyles(buttonToken: ReturnType<typeof getButtonToken>, size: SegmentedSize) {
  const buttonSize = getButtonSize(size)

  switch (buttonSize) {
    case 'small':
      return {
        minHeight: buttonToken.heightSM,
        paddingHorizontal: buttonToken.paddingHorizontalSM,
        fontSize: buttonToken.contentFontSizeSM,
      }
    case 'large':
      return {
        minHeight: buttonToken.heightLG,
        paddingHorizontal: buttonToken.paddingHorizontalLG,
        fontSize: buttonToken.contentFontSizeLG,
      }
    case 'normal':
    default:
      return {
        minHeight: buttonToken.height,
        paddingHorizontal: buttonToken.paddingHorizontal,
        fontSize: buttonToken.contentFontSize,
      }
  }
}

function renderOptionLabel(label: ReactNode, style?: StyleProp<TextStyle>) {
  if (typeof label === 'string' || typeof label === 'number') {
    return <Text style={style}>{label}</Text>
  }

  return label
}

export const Segmented = forwardRef<ViewComponent, SegmentedProps>(function Segmented(
  {
    options,
    value,
    defaultValue,
    onChange,
    shape = 'default',
    borderRadius,
    size = 'middle',
    block = false,
    disabled = false,
    selectedTextColor,
    style,
    styles,
    ...viewProps
  },
  ref,
) {
  const { token: themeToken } = useToken()
  const buttonToken = useComponentToken('Button', getButtonToken)
  const segmentedToken = useComponentToken('Segmented', getSegmentedToken)
  const normalizedOptions = useMemo(() => options.map(normalizeOption), [options])
  const firstValue =
    normalizedOptions.find((option) => !option.disabled)?.value ?? normalizedOptions[0]?.value
  const initialValue =
    defaultValue !== undefined &&
    normalizedOptions.some((option) => Object.is(option.value, defaultValue))
      ? defaultValue
      : firstValue
  const [uncontrolledValue, setUncontrolledValue] = useState<SegmentedOption['value'] | undefined>(
    initialValue,
  )
  const isControlled = value !== undefined
  const activeValue = isControlled ? value : uncontrolledValue
  const activeIndex = normalizedOptions.findIndex((option) => Object.is(option.value, activeValue))
  const [itemLayouts, setItemLayouts] = useState<readonly OptionLayout[]>([])
  const hasMeasuredActiveThumb = useRef(false)
  const resolvedBorderRadius =
    borderRadius ?? (shape === 'round' ? buttonToken.borderRadiusRound : buttonToken.borderRadius)
  const resolvedStyles = useMemo(
    () => getSegmentedStyles(themeToken, segmentedToken, resolvedBorderRadius, block, disabled),
    [block, disabled, resolvedBorderRadius, segmentedToken, themeToken],
  )
  const segmentedProps: SegmentedProps = {
    ...viewProps,
    options,
    value,
    defaultValue,
    onChange,
    shape,
    borderRadius,
    size,
    block,
    disabled,
    selectedTextColor,
    style,
    styles,
  }
  const styleState: SegmentedStyleState = { block, disabled, shape, size, value: activeValue }
  const semanticStyles = resolveStyles(styles, { props: segmentedProps, state: styleState })
  const { fontSize: optionFontSize, ...optionLayoutStyles } = getOptionSizeStyles(buttonToken, size)

  const setItemLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout
    if (!Number.isFinite(width) || !Number.isFinite(x)) return

    setItemLayouts((current) => {
      const next = [...current]
      if (next[index]?.width === width && next[index]?.x === x) return current
      next[index] = { width, x }
      return next
    })
  }, [])

  const activeLayout = activeIndex >= 0 ? itemLayouts[activeIndex] : undefined

  const shouldAnimate = hasMeasuredActiveThumb.current && !disabled && themeToken.motion
  const config = { ...LAYOUT_PRESET, duration: segmentedToken.animationDuration }
  const activeThumbX = useMotionValue(activeLayout?.x ?? 0, config, 0, shouldAnimate)
  const activeThumbWidth = useMotionValue(activeLayout?.width ?? 0, config, 0, shouldAnimate)
  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeThumbX.value }],
    width: activeThumbWidth.value,
  }))
  useEffect(() => {
    if (activeLayout) hasMeasuredActiveThumb.current = true
  }, [activeLayout])

  const selectOption = useCallback(
    (option: SegmentedOption) => {
      if (disabled || option.disabled) return
      if (Object.is(activeValue, option.value)) return
      if (!isControlled) setUncontrolledValue(option.value)
      onChange?.(option.value)
    },
    [activeValue, disabled, isControlled, onChange],
  )

  return (
    <View
      ref={ref}
      {...viewProps}
      accessibilityRole={viewProps.accessibilityRole ?? 'radiogroup'}
      accessibilityState={{ ...viewProps.accessibilityState, disabled }}
      style={[resolvedStyles.root, semanticStyles?.root, style]}
    >
      {activeLayout ? (
        <Animated.View
          testID="segmented-thumb"
          pointerEvents="none"
          style={[
            resolvedStyles.selectedBackground,
            {
              borderRadius: resolvedBorderRadius,
            },
            animatedThumbStyle,
          ]}
        />
      ) : null}

      {normalizedOptions.map((option, index) => {
        const active = Object.is(option.value, activeValue)
        const effectiveDisabled = disabled || Boolean(option.disabled)
        const labelStyle = [
          resolvedStyles.label,
          {
            fontSize: optionFontSize,
            lineHeight: Math.max(
              optionFontSize + 4,
              optionLayoutStyles.minHeight - buttonToken.borderWidth * 2,
            ),
          },
          semanticStyles?.label,
          active ? { color: selectedTextColor ?? segmentedToken.selectedTextColor } : undefined,
          effectiveDisabled ? { color: segmentedToken.disabledColor } : undefined,
        ]

        return (
          <Pressable
            key={`${String(option.value)}-${index}`}
            accessibilityLabel={option.accessibilityLabel}
            accessibilityRole="radio"
            accessibilityState={{ disabled: effectiveDisabled, selected: active }}
            disabled={effectiveDisabled}
            onLayout={(event) => setItemLayout(index, event)}
            onPress={() => selectOption(option)}
            pressStyle={!active && !effectiveDisabled ? 'background' : 'none'}
            pressedBackgroundColor={segmentedToken.pressedBackgroundColor}
            pressedStyle={resolvedStyles.optionPressed}
            style={[
              resolvedStyles.option,
              optionLayoutStyles,
              block ? { flex: 1 } : undefined,
              effectiveDisabled ? { opacity: buttonToken.disabledOpacity } : undefined,
              semanticStyles?.item,
            ]}
          >
            {renderOptionLabel(option.label, labelStyle)}
          </Pressable>
        )
      })}
    </View>
  )
})

Segmented.displayName = 'Segmented'
