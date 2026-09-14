import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import type { DatePickerOption, DatePickerProps, DatePickerValue } from '../date-picker'
import { DatePicker } from '../date-picker'
import { Popup } from '../popup'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createFieldCellStyles, getFieldStyles, getFieldToken } from './style'
import type { FieldLabelAlign, FieldStatus, FieldStyles } from './types'
import { useFieldValue } from './use-field-value'

type FieldDatePickerCellProps = Pick<
  CellProps,
  | 'titleExtra'
  | 'valueExtra'
  | 'extra'
  | 'vertical'
  | 'center'
  | 'valueAlign'
  | 'required'
  | 'border'
  | 'icon'
  | 'isLink'
  | 'clickable'
  | 'arrowDirection'
  | 'onPress'
  | 'onPressDebounceWait'
>

type DatePickerAdapterProps = Omit<
  DatePickerProps,
  'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel' | 'style' | 'styles'
>

export type FieldDatePickerFormatValue = (
  options: readonly DatePickerOption[],
  values: DatePickerValue,
) => ReactNode

export interface FieldDatePickerProps extends FieldDatePickerCellProps, DatePickerAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  onChange?: (value: DatePickerValue) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellStyles?: CellStyles
  styles?: FieldStyles<FieldDatePickerProps>
  placeholder?: ReactNode
  formatValue?: FieldDatePickerFormatValue
  pickerStyle?: DatePickerProps['style']
  pickerStyles?: DatePickerProps['styles']
}

function renderSelectorValue(
  value: ReactNode,
  type: 'default' | 'tertiary',
  valueAlign: NonNullable<FieldDatePickerProps['valueAlign']>,
) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text type={type} numberOfLines={1} style={{ flex: 1, textAlign: valueAlign }}>
        {value}
      </Text>
    )
  }
  return value
}

function createDisplayOptions(values: DatePickerValue): DatePickerOption[] {
  return values.map((value) => ({ text: String(value), value }))
}

export function FieldDatePicker(props: FieldDatePickerProps) {
  const {
    placeholder = '请选择日期',
    formatValue,
    pickerStyle,
    pickerStyles,
    label,
    labelExtra,
    value,
    defaultValue,
    onChange,
    valueExtra,
    extra,
    required,
    disabled = false,
    readOnly = false,
    vertical,
    labelWidth,
    labelAlign,
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
    style,
    styles,
    cellStyles,
    columnsType,
    ...datePickerProps
  } = props
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
    labelWidth,
    labelAlign,
    vertical,
    cellStyles,
  })
  const hasSelection = (currentValue?.length ?? 0) > 0
  const displayOptions = createDisplayOptions(currentValue ?? [])
  const selectedDisplay = hasSelection
    ? (formatValue?.(displayOptions, currentValue ?? []) ?? (currentValue ?? []).join('-'))
    : placeholder

  return (
    <>
      <Cell
        title={label}
        titleExtra={labelExtra}
        value={
          <View style={[{ flex: 1, minWidth: 0 }, resolved.control, semantic?.control]}>
            {renderSelectorValue(
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
        center={props.center}
        icon={icon}
        isLink={isLink}
        clickable={clickable}
        arrowDirection={arrowDirection}
        onPress={handleOpen}
        border={border}
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
