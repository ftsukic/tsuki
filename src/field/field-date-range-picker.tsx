import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { DateRangePicker } from '../date-range-picker'
import type { DateRangePickerProps, DateRangePickerValue } from '../date-range-picker'
import { formatDateRangePickerDate, isDateRangePickerValue } from '../date-range-picker/utils'
import { Icon } from '../icon'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { getCellToken } from '../cell/token'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createFieldCellStyles, getFieldStyles, getFieldToken } from './style'
import type { FieldLabelAlign, FieldStatus, FieldStyles } from './types'
import { useFieldValue } from './use-field-value'

type FieldDateRangePickerCellProps = Pick<
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

type DateRangePickerAdapterProps = Omit<
  DateRangePickerProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onConfirm'
  | 'onCancel'
  | 'onVisibleChange'
  | 'visible'
  | 'style'
  | 'styles'
>

export type FieldDateRangePickerFormatValue = (value: DateRangePickerValue) => ReactNode

export interface FieldDateRangePickerProps
  extends FieldDateRangePickerCellProps, DateRangePickerAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: DateRangePickerValue
  defaultValue?: DateRangePickerValue
  onChange?: (value: DateRangePickerValue) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellStyles?: CellStyles
  styles?: FieldStyles<FieldDateRangePickerProps>
  placeholder?: ReactNode | readonly [ReactNode?, ReactNode?]
  formatValue?: FieldDateRangePickerFormatValue
  pickerStyle?: DateRangePickerProps['style']
  pickerStyles?: DateRangePickerProps['styles']
}

const DEFAULT_PLACEHOLDER = ['请选择', '请选择'] as const

function getPlaceholderValues(
  placeholder: FieldDateRangePickerProps['placeholder'],
): readonly [ReactNode?, ReactNode?] {
  if (Array.isArray(placeholder)) return [placeholder[0], placeholder[1]]
  return [placeholder, placeholder]
}

function getValueJustification(valueAlign: NonNullable<FieldDateRangePickerProps['valueAlign']>) {
  return valueAlign === 'left' ? 'flex-start' : valueAlign === 'center' ? 'center' : 'flex-end'
}

function renderSelectorValue(
  value: ReactNode,
  type: 'default' | 'tertiary',
  valueAlign: NonNullable<FieldDateRangePickerProps['valueAlign']>,
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

export function FieldDateRangePicker(props: FieldDateRangePickerProps) {
  const {
    placeholder = DEFAULT_PLACEHOLDER,
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
    ...dateRangePickerProps
  } = props
  const [visible, setVisible] = useState(false)
  const { token } = useToken()
  const cellToken = useComponentToken('Cell', getCellToken)
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = resolveFieldStatus(status, errorMessage)
  const state = { status: effectiveStatus }
  const semantic = resolveStyles(styles, { props, state })
  const resolved = getFieldStyles(fieldToken, token, state)
  const { currentValue, setValue } = useFieldValue<DateRangePickerValue>({
    value,
    defaultValue,
    onChange,
  })
  const resolvedValueAlign = valueAlign ?? (vertical ? 'left' : 'right')
  const placeholderValues = getPlaceholderValues(placeholder)
  const selectedValue = isDateRangePickerValue(currentValue) ? currentValue : undefined
  const hasSelection = selectedValue !== undefined

  const handleOpen = useCallback<NonNullable<FieldDateRangePickerProps['onPress']>>(
    (event) => {
      if (disabled || readOnly) return
      onPress?.(event)
      setVisible(true)
    },
    [disabled, onPress, readOnly],
  )

  const handleConfirm = useCallback(
    (nextValue: DateRangePickerValue) => {
      setValue(nextValue)
      setVisible(false)
    },
    [setValue],
  )

  const handleCancel = useCallback(() => {
    setVisible(false)
  }, [])

  const defaultStartDisplay = renderSelectorValue(
    hasSelection ? formatDateRangePickerDate(selectedValue[0]) : placeholderValues[0],
    hasSelection ? 'default' : 'tertiary',
    resolvedValueAlign,
  )
  const defaultEndDisplay = renderSelectorValue(
    hasSelection ? formatDateRangePickerDate(selectedValue[1]) : placeholderValues[1],
    hasSelection ? 'default' : 'tertiary',
    resolvedValueAlign,
  )
  const hasCustomDisplay = hasSelection && formatValue !== undefined
  const display = hasCustomDisplay ? (
    renderSelectorValue(formatValue!(selectedValue), 'default', resolvedValueAlign)
  ) : (
    <>
      {defaultStartDisplay}
      <Icon
        color={cellToken.iconColor}
        name="SwapRightOutlined"
        size={cellToken.iconSize}
        style={{ marginHorizontal: token.paddingXXS / 2 }}
      />
      {defaultEndDisplay}
    </>
  )

  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    labelWidth,
    labelAlign,
    vertical,
    cellStyles,
  })

  return (
    <>
      <Cell
        title={label}
        titleExtra={labelExtra}
        value={
          <View
            style={[
              {
                flex: 1,
                minWidth: 0,
              },
              resolved.control,
              semantic?.control,
            ]}
          >
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: getValueJustification(resolvedValueAlign),
              }}
            >
              {display}
            </View>
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
      <DateRangePicker
        {...dateRangePickerProps}
        value={currentValue}
        visible={visible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        style={pickerStyle}
        styles={pickerStyles}
      />
    </>
  )
}

FieldDateRangePicker.displayName = 'FieldDateRangePicker'
