import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { Popup } from '../popup'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { PickerToolbar } from './PickerToolbar'
import { PickerView } from './PickerView'
import { getPickerStyles } from './styles'
import { getPickerToken } from './token'
import { resolvePickerState } from './usePicker'
import type { PickerOption, PickerProps, PickerValue } from './types'

export const Picker = forwardRef<View, PickerProps>(function Picker(
  {
    columns,
    value,
    defaultValue,
    title,
    showToolbar = true,
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    visible,
    overlay = true,
    closeOnPressOverlay = true,
    safeAreaInsetBottom = true,
    duration,
    onChange,
    onConfirm,
    onCancel,
    itemHeight,
    visibleItemCount,
    style,
    styles,
    testID,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Picker', getPickerToken)
  const initialValues = useMemo(
    () => resolvePickerState(columns, value ?? defaultValue).values,
    [columns, defaultValue, value],
  )
  const [committedValues, setCommittedValues] = useState<readonly PickerValue[]>(initialValues)
  const [draftValues, setDraftValues] = useState<readonly PickerValue[]>(initialValues)
  const committedValuesRef = useRef(committedValues)
  const previousVisibleRef = useRef<boolean | undefined>(visible)
  const isPopup = visible !== undefined
  const isVisible = visible === true

  committedValuesRef.current = committedValues

  useEffect(() => {
    const nextValues = resolvePickerState(columns, value ?? committedValuesRef.current).values
    committedValuesRef.current = nextValues
    setCommittedValues(nextValues)
    if (value !== undefined || visible !== true) setDraftValues(nextValues)
  }, [columns, value, visible])

  useEffect(() => {
    if (!isPopup) {
      previousVisibleRef.current = visible
      return
    }

    const wasVisible = previousVisibleRef.current
    previousVisibleRef.current = visible
    if (isVisible && wasVisible !== true) {
      const nextValues =
        value === undefined ? committedValuesRef.current : resolvePickerState(columns, value).values
      setDraftValues(nextValues)
    }
  }, [columns, isPopup, isVisible, value, visible])

  const itemHeightValue = Number.isFinite(itemHeight)
    ? Math.max(1, itemHeight as number)
    : token.picker_item_height
  const visibleItemCountValue = Number.isFinite(visibleItemCount)
    ? Math.max(1, Math.floor(visibleItemCount as number))
    : token.picker_visible_item_count
  const resolved = useMemo(
    () =>
      getPickerStyles(
        token,
        itemHeightValue,
        visibleItemCountValue % 2 === 0 ? visibleItemCountValue + 1 : visibleItemCountValue,
      ),
    [itemHeightValue, token, visibleItemCountValue],
  )
  const resolvedState = useMemo(
    () => resolvePickerState(columns, draftValues),
    [columns, draftValues],
  )
  const pickerProps: PickerProps = {
    ...viewProps,
    columns,
    value,
    defaultValue,
    title,
    showToolbar,
    confirmButtonText,
    cancelButtonText,
    visible,
    overlay,
    closeOnPressOverlay,
    safeAreaInsetBottom,
    duration,
    onChange,
    onConfirm,
    onCancel,
    itemHeight,
    visibleItemCount,
    style,
    styles,
  }
  const semantic = resolveStyles(styles, {
    props: pickerProps,
    state: {
      values: resolvedState.values,
      options: resolvedState.options,
      indexes: resolvedState.indexes,
      visible: isVisible,
    },
  })

  const handleChange = (nextValues: readonly PickerValue[], options: readonly PickerOption[]) => {
    setDraftValues(nextValues)
    onChange?.(nextValues, options)
  }

  const handleConfirm = () => {
    const result = resolvePickerState(columns, draftValues)
    if (value === undefined) {
      committedValuesRef.current = result.values
      setCommittedValues(result.values)
    }
    setDraftValues(result.values)
    onConfirm?.(result.values, result.options)
  }

  const handleCancel = () => {
    setDraftValues(committedValuesRef.current)
    onCancel?.()
  }

  const content = (
    <View
      {...viewProps}
      ref={isPopup ? undefined : ref}
      style={[resolved.root, semantic?.root, !isPopup ? semantic?.container : null, style]}
      testID={testID ?? 'picker'}
    >
      {showToolbar ? (
        <PickerToolbar
          buttonLabelStyle={semantic?.toolbarButtonLabel}
          buttonStyle={semantic?.toolbarButton}
          cancelButtonText={cancelButtonText}
          confirmButtonText={confirmButtonText}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          style={semantic?.toolbar}
          testID="picker-toolbar"
          title={title}
        />
      ) : null}
      <PickerView
        columns={columns}
        defaultValue={defaultValue}
        itemHeight={itemHeight}
        onChange={handleChange}
        styles={{
          column: semantic?.column,
          columns: semantic?.columns,
          indicator: semantic?.indicator,
          item: semantic?.item,
          itemLabel: semantic?.itemLabel,
          mask: semantic?.mask,
          root: undefined,
        }}
        value={draftValues}
        visibleItemCount={visibleItemCount}
      />
    </View>
  )

  if (!isPopup) return content

  return (
    <Popup
      closeOnPressOverlay={closeOnPressOverlay}
      duration={duration}
      destroyOnClosed
      onRequestClose={handleCancel}
      overlay={overlay}
      position="bottom"
      ref={ref}
      round
      safeAreaInsetBottom={safeAreaInsetBottom}
      style={[resolved.container, semantic?.container]}
      visible={isVisible}
    >
      {content}
    </Popup>
  )
})

Picker.displayName = 'Picker'
