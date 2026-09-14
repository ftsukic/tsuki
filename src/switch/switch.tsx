import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { Animated, Easing, Platform } from 'react-native'
import { Loading } from '../loading'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { useControllableValue } from './state'
import {
  getSwitchDimensions,
  getSwitchStyles,
  getSwitchTranslateX,
  resolveSwitchSize,
} from './style'
import { getSwitchToken } from './token'
import type { SwitchProps, SwitchStyleState } from './types'

type SwitchRef = React.ComponentRef<typeof InteractionPressable>

const switchEasing = Easing.bezier(0.3, 1.05, 0.4, 1.05)
// Vant's background-color transition does not specify a timing function, so
// it uses CSS's default ease curve instead of the node's spring-like curve.
const switchTrackEasing = Easing.bezier(0.25, 0.1, 0.25, 1)

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
  const { token: themeToken } = useToken()
  const token = useComponentToken('Switch', getSwitchToken)
  const resolvedSize = resolveSwitchSize(size)
  const dimensions = getSwitchDimensions(token, resolvedSize)
  const [currentValue, setValue] = useControllableValue({
    value,
    defaultValue: defaultValue !== undefined ? defaultValue : inactiveValue,
    onChange,
  })
  const active = Object.is(currentValue, activeValue)
  const activeRef = useRef(active)
  activeRef.current = active
  const beforeChangeRequestRef = useRef(0)
  const currentValueRef = useRef(currentValue)
  currentValueRef.current = currentValue
  const translateProgress = useRef(new Animated.Value(active ? 1 : 0)).current
  const trackProgress = useRef(new Animated.Value(active ? 1 : 0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)
  const previousActiveRef = useRef(active)
  const activeTrackColor = activeColor ?? token.activeColor
  const inactiveTrackColor = inactiveColor ?? token.inactiveColor
  const canAnimateTrackColor =
    typeof activeTrackColor === 'string' && typeof inactiveTrackColor === 'string'
  const animatedTrackColor = canAnimateTrackColor
    ? trackProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveTrackColor, activeTrackColor],
      })
    : undefined

  useEffect(() => {
    const target = active ? 1 : 0
    const shouldAnimate = previousActiveRef.current !== active && themeToken.motion
    previousActiveRef.current = active
    animationRef.current?.stop()
    animationRef.current = null

    if (!shouldAnimate || token.animationDuration <= 0) {
      translateProgress.setValue(target)
      trackProgress.setValue(target)
      return
    }

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(translateProgress, {
        duration: token.animationDuration,
        easing: switchEasing,
        toValue: target,
        useNativeDriver: Platform.OS !== 'web' && !canAnimateTrackColor,
      }),
    ]

    if (canAnimateTrackColor) {
      animations.push(
        Animated.timing(trackProgress, {
          duration: token.animationDuration,
          easing: switchTrackEasing,
          toValue: target,
          // Native Animated cannot drive backgroundColor.
          useNativeDriver: false,
        }),
      )
    }

    const animation = Animated.parallel(animations)
    animationRef.current = animation
    animation.start(({ finished }) => {
      if (animationRef.current !== animation) return
      animationRef.current = null
      if (finished) {
        translateProgress.setValue(target)
        trackProgress.setValue(target)
      }
    })

    return () => {
      animation.stop()
      if (animationRef.current === animation) animationRef.current = null
    }
  }, [
    active,
    canAnimateTrackColor,
    themeToken.motion,
    token.animationDuration,
    trackProgress,
    translateProgress,
  ])

  useEffect(
    () => () => {
      animationRef.current?.stop()
      animationRef.current = null
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
    <InteractionPressable
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
        const translateX = getSwitchTranslateX(token, dimensions)

        return (
          <Animated.View
            testID="switch-track"
            style={[
              resolved.track,
              animatedTrackColor && { backgroundColor: animatedTrackColor },
              semantic?.track,
            ]}
          >
            <Animated.View
              testID="switch-thumb"
              style={[
                resolved.thumb,
                semantic?.thumb,
                {
                  transform: [
                    {
                      translateX: translateProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, translateX],
                      }),
                    },
                  ],
                },
              ]}
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
    </InteractionPressable>
  )
}

const SwitchBase = forwardRef(SwitchComponent)

SwitchBase.displayName = 'Switch'

export const Switch = SwitchBase as <ActiveValueT = boolean, InactiveValueT = boolean>(
  props: SwitchProps<ActiveValueT, InactiveValueT> & React.RefAttributes<SwitchRef>,
) => React.ReactElement | null
