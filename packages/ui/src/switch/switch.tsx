import { callInterceptor, renderTextLikeJSX } from '../helpers'
import { useControllableValue } from '../hooks'
import LoadingIcon from '../loading/loading-icon'
import { useToken } from '../theme'
import type { SwitchProps } from './interface'
import { createSwitchStyles } from './style'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Animated, Pressable, type ViewStyle } from 'react-native'

function InternalSwitch<ActiveValue = boolean, InactiveValue = boolean>({
  value,
  defaultValue,
  onChange,
  beforeChange,
  activeValue = true as ActiveValue,
  inactiveValue = false as InactiveValue,
  activeColor,
  inactiveColor,
  activeChildren,
  inactiveChildren,
  onPress,
  size,
  loading = false,
  disabled = false,
  testID,
}: SwitchProps<ActiveValue, InactiveValue>) {
  const { components, token: themeToken } = useToken()
  const token = components.Switch
  const loadingToken = components.Loading
  const styles = useMemo(() => createSwitchStyles(), [])
  const translateProgress = useRef(new Animated.Value(0)).current
  const [currentValue, setCurrentValue] = useControllableValue<ActiveValue | InactiveValue>(
    {
      ...(value !== undefined ? { value } : {}),
      ...(defaultValue !== undefined ? { defaultValue } : {}),
      onChange,
    },
    { defaultValue: inactiveValue },
  )

  const active = currentValue === activeValue
  const height = size ?? token.height
  const width = size === undefined ? token.width : token.width * (height / token.height)
  const thumbSize = Math.max(1, height - 4)
  const thumbStart = 2
  const thumbEnd = Math.max(thumbStart, width - thumbSize - 2)

  useEffect(() => {
    const animation = Animated.timing(translateProgress, {
      toValue: active ? 1 : 0,
      duration: themeToken.motionDurationMid,
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [active, themeToken.motionDurationMid, translateProgress])

  const nextValue = active ? inactiveValue : activeValue
  const handlePress = () => {
    // Xiaoshu invokes onPress for the attempted gesture before checking state.
    // The actual value transition remains blocked while disabled or loading.
    onPress?.()
    if (!disabled && !loading) {
      callInterceptor(beforeChange, {
        args: [nextValue],
        done: () => setCurrentValue(nextValue),
      })
    }
  }

  const trackStyle: ViewStyle = {
    backgroundColor: active
      ? (activeColor ?? token.checkedBackgroundColor)
      : (inactiveColor ?? token.uncheckedBackgroundColor),
    borderRadius: token.borderRadius === 999 ? height / 2 : token.borderRadius,
    height,
    width,
  }

  const thumbStyle: ViewStyle = {
    backgroundColor: token.thumbColor,
    borderRadius: thumbSize / 2,
    height: thumbSize,
    width: thumbSize,
    transform: [
      {
        translateX: translateProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [thumbStart, thumbEnd],
        }),
      },
    ],
  }

  const childrenMinEdgeDistance = height / 3
  const childrenMaxEdgeDistance = thumbSize + 6
  const activeChildrenStyle: ViewStyle = {
    ...styles.children,
    height,
    paddingLeft: childrenMinEdgeDistance,
    paddingRight: childrenMaxEdgeDistance,
    transform: [
      {
        translateX: translateProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [-width, 0],
        }),
      },
    ],
  }
  const inactiveChildrenStyle: ViewStyle = {
    ...styles.children,
    height,
    marginTop: -height,
    paddingLeft: childrenMaxEdgeDistance,
    paddingRight: childrenMinEdgeDistance,
    transform: [
      {
        translateX: translateProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width],
        }),
      },
    ],
  }
  const childTextStyle = { color: token.contentColor, fontSize: Math.max(10, height / 3) }

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: active, disabled, busy: loading }}
      onPress={handlePress}
      testID={testID}
      style={styles.pressable}
    >
      <Animated.View
        style={[trackStyle, styles.track, disabled && { opacity: token.disabledOpacity }]}
      >
        <Animated.View style={[styles.childrenWrap, { width, height }]}>
          <Animated.View style={activeChildrenStyle}>
            {renderTextLikeJSX(activeChildren, childTextStyle)}
          </Animated.View>
          <Animated.View style={inactiveChildrenStyle}>
            {renderTextLikeJSX(inactiveChildren, childTextStyle)}
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          {loading ? (
            <LoadingIcon
              size={thumbSize * 0.65}
              color={
                active ? (activeColor ?? token.checkedBackgroundColor) : loadingToken.textColor
              }
              duration={loadingToken.animationDuration}
            />
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}

export const Switch = memo(InternalSwitch) as typeof InternalSwitch
