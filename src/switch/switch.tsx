import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useMotionValue } from '../motion/useMotionValue'
import { STATE_PRESET, LAYOUT_PRESET } from '../motion/presets'
import { Loading } from '../loading'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import {
  getSwitchDimensions,
  getSwitchStyles,
  getSwitchTranslateX,
  resolveSwitchSize,
} from './style'
import { getSwitchToken } from './token'
import type { SwitchProps, SwitchStyleState } from './types'

type SwitchRef = React.ComponentRef<typeof Pressable>

function SwitchComponent<ActiveValueT = boolean, InactiveValueT = boolean>(
  {
    value,
    defaultValue,
    loading = false,
    disabled = false,
    size,
    activeColor,
    inactiveColor,
    activeValue = true as ActiveValueT,
    inactiveValue = false as InactiveValueT,
    onPress,
    onChange,
    beforeChange,
    style,
    styles,
    ...pressableProps
  }: SwitchProps<ActiveValueT, InactiveValueT>,
  ref: React.ForwardedRef<SwitchRef>,
) {
  const token = useComponentToken('Switch', getSwitchToken)
  const resolvedSize = resolveSwitchSize(size)
  const dimensions = getSwitchDimensions(token, resolvedSize)
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState<ActiveValueT | InactiveValueT>(
    defaultValue !== undefined ? defaultValue : inactiveValue,
  )
  const currentValue = isControlled ? (value as ActiveValueT | InactiveValueT) : uncontrolledValue
  const setValue = useCallback(
    (nextValue: ActiveValueT | InactiveValueT) => {
      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
    },
    [isControlled, onChange],
  )
  const active = Object.is(currentValue, activeValue)
  const activeRef = useRef(active)
  activeRef.current = active
  const beforeChangeRequestRef = useRef(0)
  const currentValueRef = useRef(currentValue)
  currentValueRef.current = currentValue
  const translateProgress = useMotionValue(active ? 1 : 0, STATE_PRESET, active ? 1 : 0)
  const trackProgress = useMotionValue(
    active ? 1 : 0,
    { ...LAYOUT_PRESET, duration: token.animationDuration },
    active ? 1 : 0,
  )
  const activeTrackColor = activeColor ?? token.activeColor
  const inactiveTrackColor = inactiveColor ?? token.inactiveColor
  const canAnimateTrackColor =
    typeof activeTrackColor === 'string' && typeof inactiveTrackColor === 'string'
  const animatedTrackStyle = useAnimatedStyle(() =>
    canAnimateTrackColor
      ? {
          backgroundColor: interpolateColor(
            trackProgress.value,
            [0, 1],
            [inactiveTrackColor as string, activeTrackColor as string],
          ),
        }
      : {},
  )
  const translateX = getSwitchTranslateX(token, dimensions)
  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateProgress.value * translateX }],
  }))

  useEffect(
    () => () => {
      beforeChangeRequestRef.current += 1
    },
    [],
  )

  const handlePress = useCallback(() => {
    if (disabled || loading) return

    onPress?.()
    const requestId = ++beforeChangeRequestRef.current
    const sourceValue = currentValueRef.current
    const nextValue = activeRef.current ? inactiveValue : activeValue

    if (!beforeChange) {
      setValue(nextValue)
      return
    }

    const result = beforeChange(nextValue)
    if (typeof result === 'boolean') {
      if (result !== false) setValue(nextValue)
      return
    }

    void result.then(
      (allowed) => {
        if (
          requestId !== beforeChangeRequestRef.current ||
          !Object.is(currentValueRef.current, sourceValue)
        ) {
          return
        }
        if (allowed !== false) setValue(nextValue)
      },
      () => undefined,
    )
  }, [activeValue, beforeChange, disabled, inactiveValue, loading, onPress, setValue])

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      accessibilityRole="switch"
      accessibilityState={{
        ...pressableProps.accessibilityState,
        busy: loading,
        checked: active,
        disabled: disabled || loading,
      }}
      disabled={disabled || loading}
      onPress={handlePress}
      pressStyle="opacity"
      pressedOpacity={token.pressedOpacity}
      style={({ hovered, pressed }) => {
        const state: SwitchStyleState = {
          active,
          disabled,
          hovered: Boolean(hovered),
          loading,
          pressed,
          size: resolvedSize,
        }
        const resolved = getSwitchStyles(token, resolvedSize, state, activeColor, inactiveColor)
        const switchProps = {
          ...pressableProps,
          value,
          defaultValue,
          loading,
          disabled,
          size,
          activeColor,
          inactiveColor,
          activeValue,
          inactiveValue,
          onPress,
          onChange,
          beforeChange,
          style,
          styles,
        }
        const semantic = resolveStyles(styles, { props: switchProps, state })
        return [resolved.root, semantic?.root, style]
      }}
    >
      {({ hovered, pressed }) => {
        const state: SwitchStyleState = {
          active,
          disabled,
          hovered: Boolean(hovered),
          loading,
          pressed,
          size: resolvedSize,
        }
        const resolved = getSwitchStyles(token, resolvedSize, state, activeColor, inactiveColor)
        const switchProps = {
          ...pressableProps,
          value,
          defaultValue,
          loading,
          disabled,
          size,
          activeColor,
          inactiveColor,
          activeValue,
          inactiveValue,
          onPress,
          onChange,
          beforeChange,
          style,
          styles,
        }
        const semantic = resolveStyles(styles, { props: switchProps, state })

        return (
          <Animated.View
            testID="switch-track"
            style={[resolved.track, animatedTrackStyle, semantic?.track]}
          >
            <Animated.View
              testID="switch-thumb"
              style={[resolved.thumb, semantic?.indicator, animatedThumbStyle]}
            >
              {loading ? (
                <Loading
                  color={
                    active
                      ? (activeColor ?? token.activeColor)
                      : (inactiveColor ?? token.loadingColor)
                  }
                  size={Math.max(1, (dimensions.height - token.thumbInset * 2) * 0.6)}
                  style={[resolved.loading, semantic?.loading]}
                />
              ) : null}
            </Animated.View>
          </Animated.View>
        )
      }}
    </Pressable>
  )
}

const SwitchBase = forwardRef(SwitchComponent)

SwitchBase.displayName = 'Switch'

export const Switch = SwitchBase as <ActiveValueT = boolean, InactiveValueT = boolean>(
  props: SwitchProps<ActiveValueT, InactiveValueT> & React.RefAttributes<SwitchRef>,
) => React.ReactElement | null
