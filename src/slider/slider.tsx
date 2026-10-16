import { useState } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { GestureDetector } from '../gesture'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { getSliderToken } from './token'
import { sliderStyles as base } from './style'
import { normalizeSliderBounds, normalizeSliderValue } from './value'
import { useSliderGesture } from './useSliderGesture'
import type { SliderProps } from './types'

export function Slider(props: SliderProps) {
  const {
    value,
    defaultValue,
    min: minProp,
    max: maxProp,
    step: stepProp,
    disabled = false,
    readonly = false,
    reverse = false,
    included = true,
    marks,
    onChange,
    onChangeComplete,
    renderThumb,
    style,
    styles,
    onLayout,
    onAccessibilityAction,
    accessibilityState,
    accessibilityValue,
    accessibilityActions,
    ...viewProps
  } = props
  const { min, max, step } = normalizeSliderBounds(minProp, maxProp, stepProp)
  const [internalValue, setInternalValue] = useState(defaultValue ?? min)
  const current = normalizeSliderValue(value ?? internalValue, min, max, step)
  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)
  const token = useComponentToken('Slider', getSliderToken)
  const { token: theme } = useToken()
  const enabled = !disabled && !readonly
  const change = (next: number) => {
    if (!enabled) return
    if (value === undefined) setInternalValue(next)
    onChange?.(next)
  }
  const { gesture, position, dragging, staticAdapter, responderHandlers } = useSliderGesture({
    value: current,
    min,
    max,
    step,
    width,
    offset,
    reverse,
    enabled,
    testID: props.testID,
    onChange: change,
    onComplete: (next) => onChangeComplete?.(next),
  })
  const state = { value: current, dragging, disabled, readonly }
  const semantic = resolveStyles(styles, { props, state })
  const thumbStyle = useAnimatedStyle(() => {
    const fraction = max === min ? 0 : (position.value - min) / (max - min)
    return { left: `${(reverse ? 1 - fraction : fraction) * 100}%` }
  })
  const trackStyle = useAnimatedStyle(() => ({
    width: `${max === min ? 0 : ((position.value - min) / (max - min)) * 100}%`,
  }))
  const entries = Object.entries(marks ?? {}).filter(
    ([key]) => Number.isFinite(Number(key)) && Number(key) >= min && Number(key) <= max,
  )
  const hasLabels = entries.some(
    ([, label]) => label !== null && label !== undefined && label !== '',
  )

  return (
    <GestureDetector gesture={gesture}>
      <View
        {...viewProps}
        {...responderHandlers}
        pointerEvents={staticAdapter ? 'box-only' : viewProps.pointerEvents}
        accessible
        accessibilityRole="adjustable"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={accessibilityValue?.text}
        aria-disabled={disabled || max === min}
        accessibilityState={{ ...accessibilityState, disabled: disabled || max === min }}
        accessibilityValue={{ ...accessibilityValue, min, max, now: current }}
        accessibilityActions={
          enabled && max > min
            ? [{ name: 'increment' }, { name: 'decrement' }, ...(accessibilityActions ?? [])]
            : []
        }
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName
          if (action !== 'increment' && action !== 'decrement') {
            onAccessibilityAction?.(event)
            return
          }
          if (!enabled) return
          const next = normalizeSliderValue(
            action === 'increment'
              ? current + step
              : min + (Math.ceil(Number(((current - min) / step).toPrecision(15))) - 1) * step,
            min,
            max,
            step,
          )
          if (next !== current) {
            change(next)
            onChangeComplete?.(next)
          }
        }}
        onLayout={onLayout}
        style={[
          base.root,
          {
            paddingHorizontal: token.thumbSize / 2,
            paddingBottom: hasLabels ? 24 : 0,
            opacity: disabled ? token.disabledOpacity : 1,
          },
          semantic?.root,
          style,
        ]}
      >
        <View
          collapsable={false}
          testID={props.testID ? `${props.testID}-body` : undefined}
          onLayout={(event) => {
            setWidth(event.nativeEvent.layout.width)
            setOffset(event.nativeEvent.layout.x)
          }}
          style={[base.body, semantic?.body]}
        >
          <View
            pointerEvents="none"
            style={[
              base.rail,
              { height: token.railHeight, backgroundColor: token.railColor },
              semantic?.rail,
            ]}
          />
          {included ? (
            <Animated.View
              pointerEvents="none"
              style={[
                base.track,
                {
                  height: token.railHeight,
                  backgroundColor: token.trackColor,
                  ...(reverse ? { right: 0 } : { left: 0 }),
                },
                semantic?.track,
                trackStyle,
              ]}
            />
          ) : null}
          {entries.map(([key, label]) => {
            const fraction = max === min ? 0 : (Number(key) - min) / (max - min)
            const left = `${(reverse ? 1 - fraction : fraction) * 100}%` as const
            return (
              <View
                key={key}
                pointerEvents="none"
                style={{ position: 'absolute', left, top: 0, bottom: 0 }}
              >
                <View style={[base.mark, { backgroundColor: theme.colorBorder }, semantic?.mark]} />
                {label !== null && label !== undefined && label !== '' ? (
                  <View style={base.markLabel}>
                    {typeof label === 'string' || typeof label === 'number' ? (
                      <Text
                        style={[
                          { fontSize: theme.fontSizeSM, lineHeight: theme.lineHeightSM },
                          semantic?.markLabel,
                        ]}
                      >
                        {label}
                      </Text>
                    ) : (
                      label
                    )}
                  </View>
                ) : null}
              </View>
            )
          })}
          <Animated.View
            pointerEvents="none"
            style={[
              base.thumbContainer,
              { width: token.thumbSize, height: token.thumbSize, marginLeft: -token.thumbSize / 2 },
              thumbStyle,
            ]}
          >
            <View
              style={[
                base.thumb,
                { backgroundColor: token.thumbColor, borderColor: token.thumbBorderColor },
                semantic?.thumb,
              ]}
            >
              {renderThumb?.(state)}
            </View>
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  )
}
