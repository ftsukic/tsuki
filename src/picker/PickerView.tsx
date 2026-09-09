import { forwardRef, useId, useMemo } from 'react'
import { View } from 'react-native'
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { PickerColumn } from './PickerColumn'
import { getPickerStyles } from './styles'
import { getPickerToken } from './token'
import { usePicker } from './usePicker'
import type { PickerViewProps } from './types'
import type { StyleProp, ViewStyle } from 'react-native'

function normalizePositive(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Math.max(1, value as number) : fallback
}

function normalizeVisibleItemCount(value: number | undefined, fallback: number) {
  const count = Math.max(1, Math.floor(normalizePositive(value, fallback)))
  return count % 2 === 0 ? count + 1 : count
}

interface PickerMaskProps {
  height: number
  maskHeight: number
  color: string
  opacities: readonly number[]
  style: StyleProp<ViewStyle>
  testID: string
}

function PickerMask({ height, maskHeight, color, opacities, style, testID }: PickerMaskProps) {
  const id = useId().replace(/:/gu, '')
  const stops = opacities.length > 0 ? opacities : [1]
  const getOffset = (index: number) => `${(index / Math.max(1, stops.length - 1)) * 100}%`
  const topStops = [
    ...stops.map((opacity, index) => (
      <Stop
        key={`top-${index}`}
        offset={getOffset(index)}
        stopColor={color}
        stopOpacity={opacity}
      />
    )),
    <Stop key="top-end" offset="100%" stopColor={color} stopOpacity={0} />,
  ]
  const bottomStops = [
    <Stop key="bottom-start" offset="0%" stopColor={color} stopOpacity={0} />,
    ...stops
      .slice()
      .reverse()
      .map((opacity, index) => (
        <Stop
          key={`bottom-${index}`}
          offset={`${((index + 1) / stops.length) * 100}%`}
          stopColor={color}
          stopOpacity={opacity}
        />
      )),
  ]

  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={style}
      testID={testID}
      viewBox={`0 0 100 ${height}`}
      width="100%"
    >
      <Defs>
        <LinearGradient id={`${id}-top`} x1="0%" x2="0%" y1="0%" y2="100%">
          {topStops}
        </LinearGradient>
        <LinearGradient id={`${id}-bottom`} x1="0%" x2="0%" y1="0%" y2="100%">
          {bottomStops}
        </LinearGradient>
      </Defs>
      <Rect fill={`url(#${id}-top)`} height={maskHeight} width="100" x="0" y="0" />
      <Rect
        fill={`url(#${id}-bottom)`}
        height={maskHeight}
        width="100"
        x="0"
        y={height - maskHeight}
      />
    </Svg>
  )
}

export const PickerView = forwardRef<View, PickerViewProps>(function PickerView(
  {
    columns,
    defaultValue,
    value,
    onChange,
    itemHeight: itemHeightProp,
    visibleItemCount: visibleItemCountProp,
    style,
    styles,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Picker', getPickerToken)
  const itemHeight = normalizePositive(itemHeightProp, token.picker_item_height)
  const visibleItemCount = normalizeVisibleItemCount(
    visibleItemCountProp,
    token.picker_visible_item_count,
  )
  const picker = usePicker({
    columns,
    defaultValue,
    value,
    onChange: (nextValues, nextOptions) => onChange?.(nextValues, nextOptions),
  })
  const resolved = useMemo(
    () => getPickerStyles(token, itemHeight, visibleItemCount),
    [itemHeight, token, visibleItemCount],
  )
  const maskHeight = ((visibleItemCount - 1) * itemHeight) / 2
  const pickerViewProps: PickerViewProps = {
    ...viewProps,
    columns,
    defaultValue,
    value,
    onChange,
    itemHeight: itemHeightProp,
    visibleItemCount: visibleItemCountProp,
    style,
    styles,
  }
  const semantic = resolveStyles(styles, {
    props: pickerViewProps,
    state: { values: picker.values, options: picker.options, indexes: picker.indexes },
  })

  return (
    <View
      ref={ref}
      {...viewProps}
      style={[resolved.view, resolved.root, semantic?.root, style]}
      testID={viewProps.testID ?? 'picker-view'}
    >
      <View style={[resolved.columns, semantic?.columns]} testID="picker-columns">
        {picker.columns.map((column, columnIndex) => (
          <PickerColumn
            key={columnIndex}
            columnIndex={columnIndex}
            itemHeight={itemHeight}
            itemLabelStyle={semantic?.itemLabel}
            itemStyle={semantic?.item}
            items={column.items}
            onIndexChange={(index) => picker.select(columnIndex, index)}
            selectedIndex={column.index}
            style={semantic?.column}
            testID={`picker-column-${columnIndex}`}
            visibleItemCount={visibleItemCount}
          />
        ))}
      </View>
      <PickerMask
        color={token.picker_mask_color}
        height={itemHeight * visibleItemCount}
        maskHeight={maskHeight}
        opacities={token.picker_mask_opacities}
        style={[resolved.mask, semantic?.mask]}
        testID="picker-mask"
      />
      <View
        pointerEvents="none"
        style={[resolved.indicator, semantic?.indicator]}
        testID="picker-indicator"
      />
    </View>
  )
})

PickerView.displayName = 'PickerView'
