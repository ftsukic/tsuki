import { renderTextLikeJSX } from '../helpers'
import { useControllableValue } from '../hooks'
import { useToken } from '../theme'
import type {
  SegmentedOption,
  SegmentedOptionInput,
  SegmentedProps,
  SegmentedSize,
  SegmentedValue,
} from './interface'
import { createSegmentedStyles } from './style'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

interface OptionLayout {
  x: number
  width: number
}

function isSegmentedOption<T extends SegmentedValue>(
  option: SegmentedOptionInput<T>,
): option is SegmentedOption<T> {
  return typeof option === 'object' && option !== null && 'value' in option
}

function normalizeOption<T extends SegmentedValue>(
  option: SegmentedOptionInput<T>,
): SegmentedOption<T> {
  return isSegmentedOption(option) ? option : { label: String(option), value: option }
}

function getOptionKey<T extends SegmentedValue>(option: SegmentedOption<T>) {
  return `${typeof option.value}:${String(option.value)}`
}

function getSizeValues(
  size: SegmentedSize,
  token: ReturnType<typeof useToken>['components']['Segmented'],
) {
  if (size === 'small') {
    return {
      fontSize: token.fontSizeSM,
      height: token.heightSM,
      paddingHorizontal: token.itemPaddingHorizontalSM,
    }
  }
  if (size === 'large') {
    return {
      fontSize: token.fontSizeLG,
      height: token.heightLG,
      paddingHorizontal: token.itemPaddingHorizontalLG,
    }
  }
  return {
    fontSize: token.fontSize,
    height: token.height,
    paddingHorizontal: token.itemPaddingHorizontal,
  }
}

function InternalSegmented<T extends SegmentedValue>({
  value,
  defaultValue,
  options,
  disabled = false,
  block = false,
  size = 'medium',
  onChange,
  theme,
  style,
  testID,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Segmented, ...theme }
  const normalizedOptions = useMemo(
    () => options.map((option) => normalizeOption(option)),
    [options],
  )
  const optionKeys = useMemo(
    () => normalizedOptions.map((option) => getOptionKey(option)).join('|'),
    [normalizedOptions],
  )
  const initialValue = defaultValue ?? normalizedOptions[0]?.value
  const [selected, setSelected] = useControllableValue<T>(
    value === undefined ? { defaultValue: initialValue, onChange } : { value, onChange },
  )
  const [layouts, setLayouts] = useState<Array<OptionLayout | undefined>>([])
  const thumbX = useSharedValue(0)
  const thumbWidth = useSharedValue(0)
  const hasInitialLayout = useRef(false)
  const activeIndex = normalizedOptions.findIndex((option) => option.value === selected)
  const activeLayout = activeIndex >= 0 ? layouts[activeIndex] : undefined
  const sizeValues = getSizeValues(size, token)
  const itemHeight = Math.max(1, sizeValues.height - token.trackPadding * 2)
  const styles = createSegmentedStyles(token)

  useEffect(() => {
    hasInitialLayout.current = false
    setLayouts((current) => (current.length === 0 ? current : []))
  }, [optionKeys])

  useEffect(() => {
    if (!activeLayout) return

    if (!hasInitialLayout.current) {
      thumbX.value = activeLayout.x
      thumbWidth.value = activeLayout.width
      hasInitialLayout.current = true
      return
    }

    thumbX.value = withTiming(activeLayout.x, {
      duration: themeToken.motionDurationMid,
    })
    thumbWidth.value = withTiming(activeLayout.width, {
      duration: themeToken.motionDurationMid,
    })
  }, [activeLayout, themeToken.motionDurationMid, thumbWidth, thumbX])

  const thumbStyle = useAnimatedStyle(
    () => ({
      backgroundColor: token.itemSelectedBg,
      borderRadius: token.borderRadiusItem,
      opacity: thumbWidth.value > 0 ? 1 : 0,
      width: thumbWidth.value,
      transform: [{ translateX: thumbX.value }],
    }),
    [token.borderRadiusItem, token.itemSelectedBg],
  )

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      style={[
        styles.track,
        {
          height: sizeValues.height,
          padding: token.trackPadding,
        },
        block ? styles.blockTrack : null,
        style,
      ]}
      testID={testID}
    >
      <Animated.View pointerEvents="none" style={[styles.thumb, thumbStyle]} />
      {normalizedOptions.map((option, index) => {
        const itemDisabled = disabled || Boolean(option.disabled)
        const active = option.value === selected

        return (
          <Pressable
            accessibilityLabel={option.accessibilityLabel}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled: itemDisabled }}
            disabled={itemDisabled}
            key={getOptionKey(option)}
            onLayout={(event) => {
              const nextLayout = {
                x: event.nativeEvent.layout.x,
                width: event.nativeEvent.layout.width,
              }
              setLayouts((current) => {
                const previous = current[index]
                if (previous?.x === nextLayout.x && previous?.width === nextLayout.width) {
                  return current
                }
                const next = [...current]
                next[index] = nextLayout
                return next
              })
            }}
            onPress={() => {
              if (!itemDisabled && !active) setSelected(option.value)
            }}
            style={({ pressed }) => [
              styles.item,
              {
                flex: block ? 1 : undefined,
                height: itemHeight,
                paddingHorizontal: sizeValues.paddingHorizontal,
              },
              pressed && !itemDisabled
                ? {
                    backgroundColor: token.itemActiveBg,
                    opacity: token.itemActiveOpacity,
                  }
                : null,
            ]}
          >
            {renderTextLikeJSX(option.label, {
              color: itemDisabled
                ? token.itemDisabledColor
                : active
                  ? token.itemSelectedColor
                  : token.itemColor,
              fontSize: sizeValues.fontSize,
              textAlign: 'center',
            })}
          </Pressable>
        )
      })}
    </View>
  )
}

export const Segmented = memo(InternalSegmented) as typeof InternalSegmented
export default Segmented
