import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Animated, Easing, View } from 'react-native'
import type { LayoutChangeEvent, StyleProp, TextStyle, View as ViewComponent } from 'react-native'
import { getButtonToken } from '../button/token'
import { InteractionPressable } from '../interaction'
import { useControllableSelection } from '../selection/state'
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
    size = 'middle',
    block = false,
    disabled = false,
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
  const selection = useControllableSelection({ value, defaultValue: initialValue, onChange })
  const activeValue = selection.value
  const activeIndex = normalizedOptions.findIndex((option) => Object.is(option.value, activeValue))
  const [itemLayouts, setItemLayouts] = useState<readonly OptionLayout[]>([])
  const activeThumbX = useRef(new Animated.Value(0)).current
  const activeThumbWidth = useRef(new Animated.Value(0)).current
  const activeThumbAnimation = useRef<Animated.CompositeAnimation | null>(null)
  const hasMeasuredActiveThumb = useRef(false)
  const resolvedStyles = useMemo(
    () => getSegmentedStyles(themeToken, buttonToken, segmentedToken, shape, block, disabled),
    [block, buttonToken, disabled, segmentedToken, shape, themeToken],
  )
  const segmentedProps = useMemo<SegmentedProps>(
    () => ({
      options,
      value,
      defaultValue,
      onChange,
      shape,
      size,
      block,
      disabled,
      style,
      styles,
    }),
    [block, defaultValue, disabled, onChange, options, shape, size, style, styles, value],
  )
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

  useEffect(() => {
    if (!activeLayout) return

    activeThumbAnimation.current?.stop()
    const shouldAnimate = hasMeasuredActiveThumb.current && !disabled && themeToken.motion

    if (!shouldAnimate) {
      activeThumbX.setValue(activeLayout.x)
      activeThumbWidth.setValue(activeLayout.width)
      hasMeasuredActiveThumb.current = true
      return
    }

    const easing = Easing.bezier(0.645, 0.045, 0.355, 1)
    const animation = Animated.parallel([
      Animated.timing(activeThumbX, {
        duration: segmentedToken.animationDuration,
        easing,
        toValue: activeLayout.x,
        useNativeDriver: false,
      }),
      Animated.timing(activeThumbWidth, {
        duration: segmentedToken.animationDuration,
        easing,
        toValue: activeLayout.width,
        useNativeDriver: false,
      }),
    ])
    activeThumbAnimation.current = animation
    animation.start()

    return () => animation.stop()
  }, [activeLayout, activeThumbWidth, activeThumbX, disabled, segmentedToken, themeToken.motion])

  useEffect(
    () => () => {
      activeThumbAnimation.current?.stop()
    },
    [],
  )

  const selectOption = useCallback(
    (option: SegmentedOption) => {
      if (disabled || option.disabled) return
      selection.select(option.value)
    },
    [disabled, selection],
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
            semanticStyles?.selectedBackground,
            {
              borderRadius:
                shape === 'round' ? buttonToken.borderRadiusRound : buttonToken.borderRadius,
              transform: [{ translateX: activeThumbX }],
              width: activeThumbWidth,
            },
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
          active ? { color: segmentedToken.selectedTextColor } : undefined,
          effectiveDisabled ? { color: segmentedToken.disabledColor } : undefined,
          semanticStyles?.label,
        ]

        return (
          <InteractionPressable
            key={`${String(option.value)}-${index}`}
            accessibilityRole="radio"
            accessibilityState={{ disabled: effectiveDisabled, selected: active }}
            disabled={effectiveDisabled}
            onLayout={(event) => setItemLayout(index, event)}
            onPress={() => selectOption(option)}
            style={[
              resolvedStyles.option,
              optionLayoutStyles,
              block ? { flex: 1 } : undefined,
              effectiveDisabled ? { opacity: buttonToken.disabledOpacity } : undefined,
              semanticStyles?.option,
            ]}
          >
            {({ pressed }) => (
              <>
                {pressed && !effectiveDisabled && !active ? (
                  <View pointerEvents="none" style={resolvedStyles.pressedOverlay} />
                ) : null}
                {renderOptionLabel(option.label, labelStyle)}
              </>
            )}
          </InteractionPressable>
        )
      })}
    </View>
  )
})

Segmented.displayName = 'Segmented'
