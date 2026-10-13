import { getFieldAccessibility } from './accessibility'
import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps } from '../cell'
import { Cell } from '../cell'
import type { TimePickerOption, TimePickerProps, TimePickerValue } from '../time-picker'
import { TimePicker } from '../time-picker'
import { Popup } from '../popup'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createPickerDisplayOptions, renderFieldPickerValue } from './picker-value'
import { createFieldCellStyles, getFieldStyles } from './style'
import { getFieldToken } from './token'
import type { FieldCellProps, FieldStatus, FieldStyles, FieldTitleAlign } from './types'
import { useFieldValue } from './useFieldValue'

type TimePickerAdapterProps = Omit<
  TimePickerProps,
  'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel' | 'style' | 'styles'
>

export type FieldTimePickerFormatValue = (
  options: readonly TimePickerOption[],
  values: TimePickerValue,
) => ReactNode

export interface FieldTimePickerProps extends FieldCellProps, TimePickerAdapterProps {
  title?: ReactNode
  titleExtra?: ReactNode
  description?: ReactNode
  value?: TimePickerValue
  defaultValue?: TimePickerValue
  onChange?: (value: TimePickerValue) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  help?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellProps?: Pick<CellProps, 'styles'>
  styles?: FieldStyles<FieldTimePickerProps>
  placeholder?: ReactNode
  formatValue?: FieldTimePickerFormatValue
  pickerProps?: Pick<TimePickerProps, 'style' | 'styles'>
}

export function FieldTimePicker(props: FieldTimePickerProps) {
  const {
    placeholder = '请选择时间',
    formatValue,
    pickerProps: pickerConfig,
    title,
    titleExtra,
    description,
    value,
    defaultValue,
    onChange,
    valueExtra,
    trailing,
    required,
    disabled = false,
    readOnly = false,
    vertical,
    center = true,
    titleWidth,
    titleAlign,
    valueAlign,
    help,
    errorMessage,
    status,
    leading,
    showArrow = true,
    clickable,
    arrowDirection,
    onPress,
    border,
    divider,
    style,
    styles,
    cellProps,
    columnsType,
    ...timePickerProps
  } = props
  const pickerStyle = pickerConfig?.style
  const pickerStyles = pickerConfig?.styles
  const cellStyles = cellProps?.styles
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
    titleWidth,
    titleAlign,
    vertical,
    cellStyles,
    semantic,
  })
  const hasSelection = (currentValue?.length ?? 0) > 0
  const displayOptions = createPickerDisplayOptions(currentValue ?? [])
  const selectedDisplay = hasSelection
    ? (formatValue?.(displayOptions, currentValue ?? []) ?? (currentValue ?? []).join(':'))
    : placeholder

  return (
    <>
      <Cell
        {...getFieldAccessibility(props)}
        accessibilityRole={readOnly ? 'text' : 'button'}
        accessibilityState={{ disabled, expanded: visible }}
        accessibilityValue={{
          text:
            typeof selectedDisplay === 'string' || typeof selectedDisplay === 'number'
              ? String(selectedDisplay)
              : undefined,
        }}
        title={title}
        titleExtra={titleExtra}
        description={description}
        value={
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={[resolved.control, semantic?.control]}>
              {renderFieldPickerValue(
                selectedDisplay,
                hasSelection ? 'default' : 'tertiary',
                resolvedValueAlign,
              )}
            </View>
            {renderFieldFeedback(help, errorMessage, resolved, semantic)}
          </View>
        }
        valueExtra={valueExtra}
        trailing={trailing}
        required={required}
        disabled={disabled}
        vertical={vertical}
        valueAlign={resolvedValueAlign}
        center={center}
        leading={leading}
        showArrow={showArrow}
        clickable={clickable}
        arrowDirection={arrowDirection}
        onPress={readOnly ? undefined : handleOpen}
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
