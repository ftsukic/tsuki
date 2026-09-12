import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import { InteractionPressable } from '../interaction'
import { PickerToolbar } from '../picker/picker-toolbar'
import { PickerView } from '../picker/picker-view'
import type { PickerValue } from '../picker/types'
import { Popup } from '../popup'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useToken } from '../theme'
import { createDateTimeColumns } from '../picker/date-time/columns'
import type { DateTimeColumnFormatter } from '../picker/date-time/types'
import {
  areDateRangesEqual,
  clampDateRangePickerValue,
  createDateRangePickerDate,
  formatDateRangePickerDate,
  getDateRangePickerEditBounds,
  getDateRangePickerValues,
  isDateRangePickerValue,
  normalizeDateRangePickerBounds,
  normalizeDateRangePickerValue,
} from './utils'
import type {
  DateRangePickerPart,
  DateRangePickerProps,
  DateRangePickerRef,
  DateRangePickerValue,
} from './types'
import { getDateRangePickerStyles } from './style'

const DATE_RANGE_COLUMNS = ['year', 'month', 'day'] as const

function getValueKey(value: unknown): string {
  if (!isDateRangePickerValue(value)) return value === undefined ? 'undefined' : 'invalid'
  return `${value[0].getTime()}:${value[1].getTime()}`
}

function getPartIndex(part: DateRangePickerPart): 0 | 1 {
  return part === 'start' ? 0 : 1
}

export const DateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue,
      minDate,
      maxDate,
      title,
      cancelText = '取消',
      confirmText = '确定',
      formatter,
      visible,
      onVisibleChange,
      onChange,
      onConfirm,
      onCancel,
      showToolbar = true,
      showToolbarDivider = false,
      overlay = true,
      closeOnPressOverlay = true,
      safeAreaInsetBottom = true,
      duration,
      itemHeight,
      visibleItemCount,
      style,
      styles,
      testID,
      ...viewProps
    },
    ref,
  ) {
    const { token } = useToken()
    const initialReferenceRef = useRef<Date | undefined>(undefined)
    if (!initialReferenceRef.current) {
      const initialValue = value ?? defaultValue
      const initialDate = isDateRangePickerValue(initialValue) ? initialValue[0] : new Date()
      initialReferenceRef.current = new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate(),
      )
    }

    const bounds = useMemo(
      () => normalizeDateRangePickerBounds(minDate, maxDate, initialReferenceRef.current),
      [maxDate, minDate],
    )
    const initialRange = useMemo(
      () =>
        normalizeDateRangePickerValue(value ?? defaultValue, bounds, initialReferenceRef.current),
      [bounds, defaultValue, value],
    )
    const [committedRange, setCommittedRange] = useState<DateRangePickerValue>(initialRange)
    const [draftRange, setDraftRange] = useState<DateRangePickerValue>(initialRange)
    const [activePart, setActivePart] = useState<DateRangePickerPart>('start')
    const [internalVisible, setInternalVisible] = useState(false)
    const committedRangeRef = useRef(committedRange)
    const draftRangeRef = useRef(draftRange)
    const previousVisibleRef = useRef(visible ?? false)
    const previousSyncKeyRef = useRef(
      `${getValueKey(value)}:${bounds.minDate.getTime()}:${bounds.maxDate.getTime()}`,
    )

    committedRangeRef.current = committedRange
    draftRangeRef.current = draftRange

    const isVisibleControlled = visible !== undefined
    const isVisible = visible ?? internalVisible
    const valueKey = getValueKey(value)
    const syncKey = `${valueKey}:${bounds.minDate.getTime()}:${bounds.maxDate.getTime()}`
    const resolvedRange = useMemo(
      () =>
        normalizeDateRangePickerValue(value ?? committedRange, bounds, initialReferenceRef.current),
      [bounds, committedRange, value],
    )
    const editBounds = useMemo(
      () => getDateRangePickerEditBounds(activePart, draftRange, bounds),
      [activePart, bounds, draftRange],
    )
    const columnFormatter = useMemo<DateTimeColumnFormatter | undefined>(
      () =>
        formatter
          ? (columnType, option) => ({
              ...option,
              text: formatter(columnType as 'year' | 'month' | 'day', Number(option.value)),
            })
          : undefined,
      [formatter],
    )
    const columns = useMemo(
      () =>
        createDateTimeColumns({
          columnsType: DATE_RANGE_COLUMNS,
          formatter: columnFormatter,
          maxDate: editBounds.maxDate,
          minDate: editBounds.minDate,
        }),
      [columnFormatter, editBounds.maxDate, editBounds.minDate],
    )
    const resolvedStyles = getDateRangePickerStyles(token)
    const semantic = resolveStyles(styles, {
      props: {
        ...viewProps,
        value,
        defaultValue,
        minDate,
        maxDate,
        title,
        cancelText,
        confirmText,
        formatter,
        visible,
        onVisibleChange,
        onChange,
        onConfirm,
        onCancel,
        showToolbar,
        showToolbarDivider,
        overlay,
        closeOnPressOverlay,
        safeAreaInsetBottom,
        duration,
        itemHeight,
        visibleItemCount,
        style,
        styles,
        testID,
      },
      state: { activePart, range: draftRange, visible: isVisible },
    })

    useEffect(() => {
      const shouldSync = syncKey !== previousSyncKeyRef.current
      previousSyncKeyRef.current = syncKey
      if (!shouldSync && isVisible) return

      const nextCommitted = normalizeDateRangePickerValue(
        value ?? committedRangeRef.current,
        bounds,
        initialReferenceRef.current,
      )
      if (!areDateRangesEqual(nextCommitted, committedRangeRef.current)) {
        committedRangeRef.current = nextCommitted
        setCommittedRange(nextCommitted)
      }

      const nextDraft =
        !isVisible || (shouldSync && value !== undefined)
          ? nextCommitted
          : normalizeDateRangePickerValue(
              draftRangeRef.current,
              bounds,
              initialReferenceRef.current,
            )
      if (!areDateRangesEqual(nextDraft, draftRangeRef.current)) {
        draftRangeRef.current = nextDraft
        setDraftRange(nextDraft)
      }
    }, [bounds, isVisible, syncKey, value])

    useEffect(() => {
      const wasVisible = previousVisibleRef.current
      previousVisibleRef.current = isVisible
      if (isVisible && wasVisible !== true) {
        draftRangeRef.current = resolvedRange
        setDraftRange(resolvedRange)
        setActivePart('start')
      }
    }, [isVisible, resolvedRange])

    const open = useCallback(() => {
      draftRangeRef.current = resolvedRange
      setDraftRange(resolvedRange)
      setActivePart('start')
      if (!isVisibleControlled) setInternalVisible(true)
      onVisibleChange?.(true)
    }, [isVisibleControlled, onVisibleChange, resolvedRange])

    const close = useCallback(() => {
      if (!isVisibleControlled) setInternalVisible(false)
      onVisibleChange?.(false)
    }, [isVisibleControlled, onVisibleChange])

    const handleChange = useCallback(
      (values: readonly PickerValue[]) => {
        const currentRange = draftRangeRef.current
        const index = getPartIndex(activePart)
        const nextDate = createDateRangePickerDate(values, currentRange[index], editBounds)
        const nextRange =
          activePart === 'start'
            ? ([nextDate, currentRange[1]] as const)
            : ([currentRange[0], nextDate] as const)
        const normalized = clampDateRangePickerValue(nextRange, bounds)
        draftRangeRef.current = normalized
        setDraftRange(normalized)
        onChange?.(normalized)
      },
      [activePart, bounds, editBounds, onChange],
    )

    const handleConfirm = useCallback(() => {
      const normalized = clampDateRangePickerValue(draftRangeRef.current, bounds)
      draftRangeRef.current = normalized
      setDraftRange(normalized)
      if (value === undefined) {
        committedRangeRef.current = normalized
        setCommittedRange(normalized)
      }
      onConfirm?.(normalized)
      close()
    }, [bounds, close, onConfirm, value])

    const handleCancel = useCallback(() => {
      const nextRange = normalizeDateRangePickerValue(
        value ?? committedRangeRef.current,
        bounds,
        initialReferenceRef.current,
      )
      draftRangeRef.current = nextRange
      setDraftRange(nextRange)
      setActivePart('start')
      onCancel?.()
      close()
    }, [bounds, close, onCancel, value])

    const confirm = useCallback(() => {
      if (isVisible) handleConfirm()
    }, [handleConfirm, isVisible])

    useImperativeHandle(ref, () => ({ close, confirm, open }), [close, confirm, open])

    const activeIndex = getPartIndex(activePart)
    const startDateText = formatDateRangePickerDate(draftRange[0])
    const endDateText = formatDateRangePickerDate(draftRange[1])
    const renderRangePart = (part: DateRangePickerPart, label: string, dateText: string) => {
      const isActive = part === activePart
      return (
        <InteractionPressable
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          onPress={() => setActivePart(part)}
          style={[resolvedStyles.item, semantic?.rangeItem]}
          testID={`date-range-picker-${part}`}
        >
          <Text style={[resolvedStyles.label, semantic?.rangeLabel]}>{label}</Text>
          <Text
            style={[
              resolvedStyles.value,
              isActive ? resolvedStyles.valueActive : null,
              semantic?.rangeValue,
              isActive ? semantic?.rangeValueActive : null,
            ]}
            testID={`date-range-picker-${part}-value`}
          >
            {dateText}
          </Text>
        </InteractionPressable>
      )
    }

    return (
      <Popup
        closeOnPressOverlay={closeOnPressOverlay}
        duration={duration}
        destroyOnClosed
        onRequestClose={handleCancel}
        overlay={overlay}
        position="bottom"
        round
        safeAreaInsetBottom={safeAreaInsetBottom}
        style={semantic?.container}
        visible={isVisible}
      >
        <View
          {...viewProps}
          style={[resolvedStyles.root, semantic?.root, style]}
          testID={testID ?? 'date-range-picker'}
        >
          {showToolbar ? (
            <PickerToolbar
              buttonLabelStyle={semantic?.toolbarButtonLabel}
              buttonStyle={semantic?.toolbarButton}
              cancelButtonText={cancelText}
              confirmButtonText={confirmText}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              showDivider={showToolbarDivider}
              style={semantic?.toolbar}
              titleStyle={semantic?.toolbarTitle}
              testID="picker-toolbar"
              title={title}
            />
          ) : null}
          <View
            style={[resolvedStyles.header, semantic?.rangeHeader]}
            testID="date-range-picker-header"
          >
            {renderRangePart('start', '开始时间', startDateText)}
            {renderRangePart('end', '结束时间', endDateText)}
          </View>
          <PickerView
            columns={columns}
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
            testID="date-range-picker-view"
            value={getDateRangePickerValues(draftRange[activeIndex])}
            itemHeight={itemHeight}
            visibleItemCount={visibleItemCount}
          />
        </View>
      </Popup>
    )
  },
)

DateRangePicker.displayName = 'DateRangePicker'
