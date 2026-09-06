import LoadingIcon from '../loading/loading-icon'
import { useToken } from '../theme'
import type { Column, PickerOption, PickerValue, PickerViewProps } from './interface'
import isArray from 'lodash/isArray'
import { memo, useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

const usable = (options: PickerOption[]) => options.find((option) => !option.disabled)
const asOptions = (column: Column): PickerOption[] =>
  isArray(column) ? column : 'options' in column ? column.options : [column]

function PickerView({
  columns,
  value,
  defaultValue,
  onChange,
  loading = false,
  itemHeight = 50,
  visibleItemCount = 5,
  testID,
}: PickerViewProps) {
  const { components } = useToken()
  const token = components.Picker
  const loadingToken = components.Loading
  const visible = visibleItemCount % 2 === 0 ? visibleItemCount + 1 : visibleItemCount
  const pad = Math.floor(visible / 2)
  const initial =
    defaultValue ??
    value ??
    columns
      .map((column) => usable(asOptions(column))?.value)
      .filter((item): item is PickerValue => item !== undefined)
  const [selected, setSelected] = useState<PickerValue[]>(initial)
  const isCascade =
    columns.length > 0 &&
    !isArray(columns[0]) &&
    !('options' in columns[0]) &&
    'children' in columns[0]
  const cascadeState = useMemo(() => {
    if (!isCascade) return { options: columns.map(asOptions), values: selected }
    const options: PickerOption[][] = []
    const values: PickerValue[] = []
    let current = columns as PickerOption[]
    let index = 0
    while (current.length) {
      options.push(current)
      const item = current.find((option) => option.value === selected[index]) ?? usable(current)
      if (!item) break
      values.push(item.value)
      current = item.children ?? []
      index += 1
    }
    if (!options.length) options.push(current)
    return { options, values }
  }, [columns, isCascade, selected])
  const optionColumns = cascadeState.options

  useEffect(() => {
    if (!isCascade) return
    setSelected((current) =>
      current.length === cascadeState.values.length &&
      current.every((item, index) => item === cascadeState.values[index])
        ? current
        : cascadeState.values,
    )
  }, [cascadeState.values, isCascade])

  useEffect(() => {
    if (value) setSelected(value)
  }, [value])

  const choose = (columnIndex: number, option: PickerOption) => {
    if (option.disabled) return
    const next = [...selected]
    next[columnIndex] = option.value
    if (isCascade) next.splice(columnIndex + 1)
    setSelected(next)
    const nextColumns = optionColumns.map(
      (items, index) => items.find((item) => item.value === next[index]) ?? usable(items),
    )
    onChange?.(next, nextColumns.filter(Boolean) as Column[])
  }

  return (
    <View
      testID={testID}
      style={{
        height: itemHeight * visible,
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: token.backgroundColor,
      }}
    >
      {loading ? (
        <LoadingIcon
          color={loadingToken.iconColor}
          duration={loadingToken.animationDuration}
          size={loadingToken.iconSize}
          style={{ position: 'absolute', zIndex: 1, alignSelf: 'center', top: itemHeight * 2 }}
        />
      ) : null}
      {optionColumns.map((options, columnIndex) => {
        const selectedIndex = Math.max(
          0,
          options.findIndex((option) => option.value === selected[columnIndex]),
        )
        const padded: (PickerOption | null)[] = [
          ...[...Array(pad)].map(() => null as PickerOption | null),
          ...options,
          ...[...Array(pad)].map(() => null as PickerOption | null),
        ]
        return (
          <ScrollView
            key={columnIndex}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            contentOffset={{ x: 0, y: selectedIndex * itemHeight }}
            onMomentumScrollEnd={(event) => {
              const option =
                options[
                  Math.min(
                    options.length - 1,
                    Math.round(event.nativeEvent.contentOffset.y / itemHeight),
                  )
                ]
              if (option) choose(columnIndex, option)
            }}
          >
            {padded.map((option, index) =>
              option ? (
                <Text
                  key={`${option.value}-${index}`}
                  numberOfLines={1}
                  style={{
                    height: itemHeight,
                    lineHeight: itemHeight,
                    textAlign: 'center',
                    color: option.disabled ? token.disabledTextColor : token.textColor,
                  }}
                >
                  {option.label}
                </Text>
              ) : (
                <View key={`empty-${index}`} style={{ height: itemHeight }} />
              ),
            )}
          </ScrollView>
        )
      })}
    </View>
  )
}

export default memo(PickerView)
