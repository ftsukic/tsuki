import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg'
import { Loading } from '../loading'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { PickerToolbar } from './picker-toolbar'
import { PickerColumn } from './picker-column'
import type { PickerColumnRef } from './picker-column'
import { getPickerStyles } from './style'
import { getPickerToken } from './token'
import { arePickerValuesEqual, resolvePickerState } from './utils'
import type { ResolvedPickerState } from './utils'
import type { PickerOption, PickerProps, PickerRef, PickerSelection, PickerValue } from './types'
import { usePickerGroup } from '../picker-group/context'

function PickerMask({
  height,
  maskHeight,
  color,
  opacities,
  style,
}: {
  height: number
  maskHeight: number
  color: string
  opacities: readonly number[]
  style?: object
}) {
  const id = useId().replace(/:/gu, '')
  const outer = opacities[0] ?? 0.9
  const inner = opacities[1] ?? 0.4
  return (
    <Svg
      height={height}
      preserveAspectRatio="none"
      style={[style, { pointerEvents: 'none' }]}
      testID="picker-mask"
      viewBox={`0 0 100 ${height}`}
      width="100%"
    >
      <Defs>
        <LinearGradient id={`${id}-top`} x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity={outer} />
          <Stop offset="100%" stopColor={color} stopOpacity={inner} />
        </LinearGradient>
        <LinearGradient id={`${id}-bottom`} x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity={inner} />
          <Stop offset="100%" stopColor={color} stopOpacity={outer} />
        </LinearGradient>
      </Defs>
      <Rect fill={`url(#${id}-top)`} height={maskHeight} width="100%" />
      <Rect fill={`url(#${id}-bottom)`} height={maskHeight} width="100%" y={height - maskHeight} />
    </Svg>
  )
}

export const Picker = forwardRef<PickerRef, PickerProps>(function Picker(
  {
    columns,
    value,
    defaultValue,
    title,
    showToolbar = true,
    showToolbarDivider = false,
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    swipeDuration,
    onChange,
    onConfirm,
    onCancel,
    itemHeight,
    visibleItemCount,
    loading = false,
    style,
    styles,
    testID,
    ...viewProps
  },
  ref,
) {
  const group = usePickerGroup()
  const token = useComponentToken('Picker', getPickerToken)
  const controlled = value !== undefined
  const initialRequestedValues = useMemo<readonly PickerValue[]>(
    () => value ?? defaultValue ?? [],
    [defaultValue, value],
  )
  const initialValues = useMemo(
    () => resolvePickerState(columns, initialRequestedValues).values,
    [columns, initialRequestedValues],
  )
  const [internalValues, setInternalValues] = useState<readonly PickerValue[]>(initialValues)
  const requestedValuesRef = useRef<readonly PickerValue[]>(initialRequestedValues)
  if (controlled) requestedValuesRef.current = value
  const columnsRef = useRef(columns)
  columnsRef.current = columns
  const previousResolvedStateRef = useRef<ResolvedPickerState | undefined>(undefined)
  const requestedValues = controlled ? value : internalValues
  const selectedValuesRef = useRef<readonly PickerValue[]>(initialValues)
  const columnRefs = useRef<Array<PickerColumnRef | null>>([])

  useEffect(() => {
    if (controlled) return
    const nextValues = resolvePickerState(
      columns,
      requestedValuesRef.current,
      previousResolvedStateRef.current,
    ).values
    if (!arePickerValuesEqual(internalValues, nextValues)) setInternalValues(nextValues)
  }, [columns, controlled, internalValues])

  const itemHeightValue = Number.isFinite(itemHeight)
    ? Math.max(1, itemHeight as number)
    : token.picker_item_height
  const visibleItemCountValue = Number.isFinite(visibleItemCount)
    ? Math.max(1, Math.floor(visibleItemCount as number))
    : Math.max(1, Math.floor(token.picker_visible_item_count))
  const resolved = useMemo(
    () => getPickerStyles(token, itemHeightValue, visibleItemCountValue),
    [itemHeightValue, token, visibleItemCountValue],
  )
  const resolvedState = useMemo(
    () => resolvePickerState(columns, requestedValues, previousResolvedStateRef.current),
    [columns, requestedValues],
  )
  previousResolvedStateRef.current = resolvedState
  selectedValuesRef.current = resolvedState.values
  const pickerProps: PickerProps = {
    ...viewProps,
    columns,
    value,
    defaultValue,
    title,
    showToolbar,
    showToolbarDivider,
    confirmButtonText,
    cancelButtonText,
    swipeDuration,
    onChange,
    onConfirm,
    onCancel,
    itemHeight,
    visibleItemCount,
    loading,
    style,
    styles,
  }
  const semantic = resolveStyles(styles, {
    props: pickerProps,
    state: {
      values: resolvedState.values,
      options: resolvedState.options,
      indexes: resolvedState.indexes,
    },
  })

  const handleChange = useCallback(
    (nextValues: readonly PickerValue[], options: readonly PickerOption[]) => {
      if (!controlled) {
        requestedValuesRef.current = nextValues
        setInternalValues(nextValues)
      }
      onChange?.(nextValues, options)
    },
    [controlled, onChange],
  )

  const settleColumns = useCallback(() => {
    const nextValues = [...resolvedState.values]
    columnRefs.current.forEach((column, columnIndex) => {
      const finalIndex = column?.stopMomentum()
      if (finalIndex != null) {
        const option = resolvedState.columns[columnIndex]?.items[finalIndex]
        if (option) nextValues[columnIndex] = option.value
      }
    })
    const next = resolvePickerState(columns, nextValues, resolvedState)
    if (!controlled) {
      requestedValuesRef.current = next.values
      setInternalValues(next.values)
    }
    return next
  }, [columns, controlled, resolvedState])

  const handleConfirm = useCallback((): PickerSelection => {
    const result = settleColumns()
    onConfirm?.(result.values, result.options)
    return { values: result.values, options: result.options, indexes: result.indexes }
  }, [onConfirm, settleColumns])

  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  const confirmHandlerRef = useRef(handleConfirm)
  confirmHandlerRef.current = handleConfirm
  const cancelHandlerRef = useRef(handleCancel)
  cancelHandlerRef.current = handleCancel

  const pickerRef = useMemo<PickerRef>(
    () => ({
      cancel: () => cancelHandlerRef.current(),
      confirm: () => confirmHandlerRef.current(),
      getSelectedOptions: () =>
        resolvePickerState(
          columnsRef.current,
          selectedValuesRef.current,
          previousResolvedStateRef.current,
        ).options,
      getSelectedValues: () =>
        resolvePickerState(
          columnsRef.current,
          selectedValuesRef.current,
          previousResolvedStateRef.current,
        ).values,
    }),
    [],
  )
  useImperativeHandle(ref, () => pickerRef, [pickerRef])
  useEffect(() => {
    if (group && !group.registrationDisabled) group.register(group.index, pickerRef)
    return () => {
      if (group && !group.registrationDisabled) group.register(group.index, null)
    }
  }, [group, group?.index, pickerRef])

  const content = (
    <View
      {...viewProps}
      ref={undefined}
      style={[resolved.root, semantic?.root, semantic?.container, style]}
      testID={testID ?? 'picker'}
    >
      {showToolbar && !group ? (
        <PickerToolbar
          buttonLabelStyle={semantic?.toolbarButtonLabel}
          buttonStyle={semantic?.toolbarButton}
          cancelButtonText={cancelButtonText}
          confirmButtonText={confirmButtonText}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          showDivider={showToolbarDivider}
          style={semantic?.toolbar}
          titleStyle={semantic?.toolbarTitle}
          testID="picker-toolbar"
          title={title}
        />
      ) : null}
      <View style={resolved.view} testID="picker-frame">
        <View
          accessibilityElementsHidden={loading || undefined}
          importantForAccessibility={loading ? 'no-hide-descendants' : undefined}
          style={[resolved.columns, semantic?.columns]}
          testID="picker-columns"
        >
          {resolvedState.columns.map((column, columnIndex) => (
            <PickerColumn
              key={columnIndex}
              columnIndex={columnIndex}
              disabled={loading || column.items.length === 0}
              itemHeight={itemHeightValue}
              itemLabelStyle={semantic?.itemLabel}
              itemStyle={semantic?.item}
              items={column.items}
              swipeDuration={swipeDuration ?? token.picker_swipe_duration}
              onIndexChange={(index) => {
                const nextValues = [...resolvedState.values]
                nextValues[columnIndex] = column.items[index].value
                const next = resolvePickerState(columns, nextValues, resolvedState)
                handleChange(next.values, next.options)
              }}
              ref={(columnRef) => {
                columnRefs.current[columnIndex] = columnRef
              }}
              selectedIndex={column.index}
              style={semantic?.column}
              testID={`picker-column-${columnIndex}`}
              visibleItemCount={visibleItemCountValue}
            />
          ))}
        </View>
        <PickerMask
          color={token.picker_mask_color}
          height={itemHeightValue * visibleItemCountValue}
          maskHeight={((visibleItemCountValue - 1) * itemHeightValue) / 2}
          opacities={token.picker_mask_opacities}
          style={[resolved.mask, semantic?.mask]}
        />
        <View
          style={[resolved.indicator, semantic?.indicator, { pointerEvents: 'none' }]}
          testID="picker-indicator"
        />
        {loading ? (
          <>
            <View
              style={[resolved.stateBackdrop, { pointerEvents: 'none' }]}
              testID="picker-state-backdrop"
            />
            <View
              style={[resolved.stateItem, semantic?.loading, { pointerEvents: 'none' }]}
              testID="picker-loading"
            >
              <Loading />
            </View>
          </>
        ) : null}
      </View>
    </View>
  )

  return content
})

Picker.displayName = 'Picker'
