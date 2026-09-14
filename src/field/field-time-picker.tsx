import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import type { TimePickerOption, TimePickerProps, TimePickerValue } from '../time-picker'
import { TimePicker } from '../time-picker'
import { Popup } from '../popup'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createFieldCellStyles, getFieldStyles, getFieldToken } from './style'
import type { FieldLabelAlign, FieldStatus, FieldStyles } from './types'
import { useFieldValue } from './use-field-value'

type FieldTimePickerCellProps = Pick<
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

type TimePickerAdapterProps = Omit<
  TimePickerProps,
  'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel' | 'style' | 'styles'
>

export type FieldTimePickerFormatValue = (
  options: readonly TimePickerOption[],
  values: TimePickerValue,
) => ReactNode

export interface FieldTimePickerProps extends FieldTimePickerCellProps, TimePickerAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: TimePickerValue
  defaultValue?: TimePickerValue
  onChange?: (value: TimePickerValue) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellStyles?: CellStyles
  styles?: FieldStyles<FieldTimePickerProps>
  placeholder?: ReactNode
  formatValue?: FieldTimePickerFormatValue
  pickerStyle?: TimePickerProps['style']
  pickerStyles?: TimePickerProps['styles']
}

function renderSelectorValue(
  value: ReactNode,
  type: 'default' | 'tertiary',
  valueAlign: NonNullable<FieldTimePickerProps['valueAlign']>,
) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text type={type} numberOfLines={1} style={{ textAlign: valueAlign }}>
        {value}
      </Text>
    )
  }
  return value
}

function createDisplayOptions(values: TimePickerValue): TimePickerOption[] {
  return values.map((value) => ({ text: String(value), value }))
}

export function FieldTimePicker(props: FieldTimePickerProps) {
  const {
    placeholder = '请选择时间',
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
    center = true,
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
    ...timePickerProps
  } = props
  const [visible, setVisible] = useState(false)
  const [draftValue, setDraftValue] = useState<TimePickerValue>([])
  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = resolveFieldStatus(status, errorMessage)
  const state = { status: effectiveStatus }
  const semantic = resolveStyles(styles, { props, state })
  const resolved = getFieldStyles(fieldToken, token, state)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const resolvedValueAlign = valueAlign ?? (vertical ? 'left' : 'right')
  const currentValueRef = useRef<TimePickerValue | undefined>(currentValue)
  currentValueRef.current = currentValue

  const handleOpen = useCallback<NonNullable<FieldTimePickerProps['onPress']>>(
    (event) => {
      if (disabled || readOnly) return
      onPress?.(event)
      setDraftValue(currentValueRef.current ?? [])
      setVisible(true)
    },
    [disabled, onPress, readOnly],
  )
  const handleChange = useCallback((nextValue: TimePickerValue) => setDraftValue(nextValue), [])
  const handleConfirm = useCallback(
    (nextValue: TimePickerValue) => {
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
    ? (formatValue?.(displayOptions, currentValue ?? []) ?? (currentValue ?? []).join(':'))
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
        center={center}
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
        <TimePicker
          {...timePickerProps}
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

FieldTimePicker.displayName = 'FieldTimePicker'
