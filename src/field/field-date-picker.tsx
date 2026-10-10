import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps } from '../cell'
import { Cell } from '../cell'
import type { DatePickerOption, DatePickerProps, DatePickerValue } from '../date-picker'
import { DatePicker } from '../date-picker'
import { Popup } from '../popup'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createPickerDisplayOptions, renderFieldPickerValue } from './picker-value'
import { createFieldCellStyles, getFieldStyles } from './style'
import { getFieldToken } from './token'
import type { FieldCellProps, FieldStatus, FieldStyles, FieldTitleAlign } from './types'
import { useFieldValue } from './useFieldValue'

type DatePickerAdapterProps = Omit<
  DatePickerProps,
  'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel' | 'style' | 'styles'
>

export type FieldDatePickerFormatValue = (
  options: readonly DatePickerOption[],
  values: DatePickerValue,
) => ReactNode

export interface FieldDatePickerProps extends FieldCellProps, DatePickerAdapterProps {
  title?: ReactNode
  titleExtra?: ReactNode
  label?: ReactNode
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  onChange?: (value: DatePickerValue) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellProps?: Pick<CellProps, 'styles'>
  styles?: FieldStyles<FieldDatePickerProps>
  placeholder?: ReactNode
  formatValue?: FieldDatePickerFormatValue
  pickerProps?: Pick<DatePickerProps, 'style' | 'styles'>
}

export function FieldDatePicker(props: FieldDatePickerProps) {
  const {
    placeholder = '请选择日期',
    formatValue,
    pickerProps: pickerConfig,
    title,
    titleExtra,
    label,
    value,
    defaultValue,
    onChange,
    valueExtra,
    extra,
    required,
    disabled = false,
    readOnly = false,
    vertical,
    center = true,
    titleWidth,
    titleAlign,
    valueAlign,
    description,
    errorMessage,
    status,
    icon,
    isLink = true,
    clickable,
    arrowDirection,
    onPress,
    border,
    divider,
    style,
    styles,
    cellProps,
    columnsType,
    ...datePickerProps
  } = props
  const pickerStyle = pickerConfig?.style
  const pickerStyles = pickerConfig?.styles
  const cellStyles = cellProps?.styles
  const [visible, setVisible] = useState(false)
  const [draftValue, setDraftValue] = useState<DatePickerValue>([])
  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = resolveFieldStatus(status, errorMessage)
  const state = { status: effectiveStatus }
  const semantic = resolveStyles(styles, { props, state })
  const resolved = getFieldStyles(fieldToken, token, state)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const resolvedValueAlign = valueAlign ?? (vertical ? 'left' : 'right')
  const currentValueRef = useRef<DatePickerValue | undefined>(currentValue)
  currentValueRef.current = currentValue

  const handleOpen = useCallback<NonNullable<FieldDatePickerProps['onPress']>>(
    (event) => {
      if (disabled || readOnly) return
      onPress?.(event)
      setDraftValue(currentValueRef.current ?? [])
      setVisible(true)
    },
    [disabled, onPress, readOnly],
  )

  const handleChange = useCallback((nextValue: DatePickerValue) => {
    setDraftValue(nextValue)
  }, [])

  const handleConfirm = useCallback(
    (nextValue: DatePickerValue) => {
      setDraftValue(nextValue)
      setValue(nextValue)
      setVisible(false)
    },
    [setValue],
  )

  const handleCancel = useCallback(() => {
    setDraftValue(currentValueRef.current ?? [])
    setVisible(false)
  }, [])

  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    titleWidth,
    titleAlign,
    vertical,
    cellStyles,
    semantic,
  })
  const hasSelection = (currentValue?.length ?? 0) > 0
  const displayOptions = createPickerDisplayOptions(currentValue ?? [])
  const selectedDisplay = hasSelection
    ? (formatValue?.(displayOptions, currentValue ?? []) ?? (currentValue ?? []).join('-'))
    : placeholder

  return (
    <>
      <Cell
        title={title}
        titleExtra={titleExtra}
        label={label}
        value={
          <View style={[{ flex: 1, minWidth: 0 }, resolved.control, semantic?.content]}>
            {renderFieldPickerValue(
              selectedDisplay,
              hasSelection ? 'default' : 'tertiary',
              resolvedValueAlign,
            )}
            {renderFieldFeedback(description, errorMessage, resolved, semantic)}
          </View>
        }
        valueExtra={valueExtra}
        extra={extra}
        required={required}
        disabled={disabled}
        vertical={vertical}
        valueAlign={resolvedValueAlign}
        center={center}
        icon={icon}
        isLink={isLink}
        clickable={clickable}
        arrowDirection={arrowDirection}
        onPress={handleOpen}
        border={border}
        divider={divider}
        style={style}
        onPressDebounceWait={props.onPressDebounceWait}
        styles={resolvedCellStyles}
      />
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        destroyOnClosed
        onRequestClose={handleCancel}
      >
        <DatePicker
          {...datePickerProps}
          columnsType={columnsType}
          value={draftValue}
          onChange={handleChange}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          style={pickerStyle}
          styles={pickerStyles}
        />
      </Popup>
    </>
  )
}

FieldDatePicker.displayName = 'FieldDatePicker'
