import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Picker } from '../picker'
import type { PickerOption, PickerProps, PickerValue } from '../picker'
import { resolvePickerState } from '../picker/usePicker'
import { Text } from '../text'
import { Field } from './field'
import type { FieldBaseProps } from './types'

type PickerAdapterProps = Omit<
  PickerProps,
  'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel' | 'visible' | 'style' | 'styles'
>

export type FieldPickerFormatValue = (
  options: readonly PickerOption[],
  values: readonly PickerValue[],
) => ReactNode

export interface FieldPickerProps
  extends FieldBaseProps<readonly PickerValue[]>, PickerAdapterProps {
  placeholder?: ReactNode
  formatValue?: FieldPickerFormatValue
  pickerStyle?: PickerProps['style']
  pickerStyles?: PickerProps['styles']
}

function renderSelectorValue(
  value: ReactNode,
  type: 'default' | 'tertiary',
  valueAlign: NonNullable<FieldBaseProps<readonly PickerValue[]>['valueAlign']>,
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

export function FieldPicker(props: FieldPickerProps) {
  const {
    columns,
    placeholder = '请选择',
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
    ...pickerProps
  } = props
  const [visible, setVisible] = useState(false)
  const [draftValues, setDraftValues] = useState<readonly PickerValue[]>([])
  const resolvedValueAlign = valueAlign ?? 'right'
  const currentValueRef = useRef<readonly PickerValue[] | undefined>(value ?? defaultValue)
  const fieldOnChangeRef = useRef<(nextValue: readonly PickerValue[]) => void>(() => undefined)

  const handleOpen = useCallback<NonNullable<FieldPickerProps['onPress']>>(
    (event) => {
      if (disabled || readOnly) return
      onPress?.(event)
      const resolved = resolvePickerState(columns, currentValueRef.current ?? [])
      setDraftValues(resolved.values)
      setVisible(true)
    },
    [columns, disabled, onPress, readOnly],
  )

  const handleChange = useCallback((nextValues: readonly PickerValue[]) => {
    setDraftValues(nextValues)
  }, [])

  const handleConfirm = useCallback((nextValues: readonly PickerValue[]) => {
    setDraftValues(nextValues)
    fieldOnChangeRef.current(nextValues)
    setVisible(false)
  }, [])

  const handleCancel = useCallback(() => {
    const resolved = resolvePickerState(columns, currentValueRef.current ?? [])
    setDraftValues(resolved.values)
    setVisible(false)
  }, [columns])

  return (
    <Field
      label={label}
      labelExtra={labelExtra}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      valueExtra={valueExtra}
      extra={extra}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      vertical={vertical}
      labelWidth={labelWidth}
      labelAlign={labelAlign}
      valueAlign={valueAlign}
      description={description}
      errorMessage={errorMessage}
      status={status}
      icon={icon}
      isLink={isLink}
      clickable={clickable}
      arrowDirection={arrowDirection}
      onPress={handleOpen}
      border={border}
      style={style}
      styles={styles}
    >
      {({ value: currentValue, onChange: handleFieldChange }) => {
        currentValueRef.current = currentValue
        fieldOnChangeRef.current = handleFieldChange
        const hasSelection = (currentValue?.length ?? 0) > 0
        const selectedState = resolvePickerState(columns, currentValue ?? [])
        const selectedDisplay =
          hasSelection && selectedState.options.length > 0
            ? (formatValue?.(selectedState.options, selectedState.values) ??
              selectedState.options.map((option) => option.text).join(' '))
            : placeholder

        return (
          <>
            {renderSelectorValue(
              selectedDisplay,
              hasSelection && selectedState.options.length > 0 ? 'default' : 'tertiary',
              resolvedValueAlign,
            )}
            <Picker
              {...pickerProps}
              columns={columns}
              value={draftValues}
              visible={visible}
              onChange={handleChange}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              style={pickerStyle}
              styles={pickerStyles}
            />
          </>
        )
      }}
    </Field>
  )
}

FieldPicker.displayName = 'FieldPicker'
