import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { Picker } from '../picker'
import type { PickerOption, PickerProps, PickerValue } from '../picker'
import { Popup } from '../popup'
import { resolvePickerState } from '../picker/utils'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createFieldCellStyles, getFieldStyles, getFieldToken } from './style'
import type { FieldLabelAlign, FieldStatus, FieldStyles } from './types'
import { useFieldValue } from './use-field-value'

type FieldPickerCellProps = Pick<
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

type PickerAdapterProps = Omit<
  PickerProps,
  'value' | 'defaultValue' | 'onChange' | 'onConfirm' | 'onCancel' | 'style' | 'styles'
>

export type FieldPickerFormatValue = (
  options: readonly PickerOption[],
  values: readonly PickerValue[],
) => ReactNode

export interface FieldPickerProps extends FieldPickerCellProps, PickerAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: readonly PickerValue[]
  defaultValue?: readonly PickerValue[]
  onChange?: (value: readonly PickerValue[]) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellStyles?: CellStyles
  styles?: FieldStyles<FieldPickerProps>
  placeholder?: ReactNode
  formatValue?: FieldPickerFormatValue
  pickerStyle?: PickerProps['style']
  pickerStyles?: PickerProps['styles']
}

function renderSelectorValue(
  value: ReactNode,
  type: 'default' | 'tertiary',
  valueAlign: NonNullable<FieldPickerProps['valueAlign']>,
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
    cellStyles,
    ...pickerProps
  } = props
  const [visible, setVisible] = useState(false)
  const [draftValues, setDraftValues] = useState<readonly PickerValue[]>([])
  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = resolveFieldStatus(status, errorMessage)
  const state = { status: effectiveStatus }
  const semantic = resolveStyles(styles, { props, state })
  const resolved = getFieldStyles(fieldToken, token, state)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const resolvedValueAlign = valueAlign ?? (vertical ? 'left' : 'right')
  const currentValueRef = useRef<readonly PickerValue[] | undefined>(currentValue)
  currentValueRef.current = currentValue

  const handleOpen = useCallback<NonNullable<FieldPickerProps['onPress']>>(
    (event) => {
      if (disabled || readOnly) return
      onPress?.(event)
      const nextState = resolvePickerState(columns, currentValueRef.current ?? [])
      setDraftValues(nextState.values)
      setVisible(true)
    },
    [columns, disabled, onPress, readOnly],
  )

  const handleChange = useCallback((nextValues: readonly PickerValue[]) => {
    setDraftValues(nextValues)
  }, [])

  const handleConfirm = useCallback(
    (nextValues: readonly PickerValue[]) => {
      setDraftValues(nextValues)
      setValue(nextValues)
      setVisible(false)
    },
    [setValue],
  )

  const handleCancel = useCallback(() => {
    const nextState = resolvePickerState(columns, currentValueRef.current ?? [])
    setDraftValues(nextState.values)
    setVisible(false)
  }, [columns])

  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    labelWidth,
    labelAlign,
    vertical,
    cellStyles,
  })
  const hasSelection = (currentValue?.length ?? 0) > 0
  const selectedState = resolvePickerState(columns, currentValue ?? [])
  const selectedDisplay =
    hasSelection && selectedState.options.length > 0
      ? (formatValue?.(selectedState.options, selectedState.values) ??
        selectedState.options.map((option) => option.text).join(' '))
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
              hasSelection && selectedState.options.length > 0 ? 'default' : 'tertiary',
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
        <Picker
          {...pickerProps}
          columns={columns}
          value={draftValues}
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

FieldPicker.displayName = 'FieldPicker'
