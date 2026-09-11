import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { useComponentToken } from '../theme'
import { createFieldCellStyles, getFieldToken } from './style'
import { useFieldValue } from './use-field-value'
import type { FieldLabelAlign } from './types'
import { Radio } from '../radio'
import type { RadioDirection, RadioGroupProps, RadioOption, RadioValue } from '../radio'

type FieldRadioCellProps = Pick<
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

type RadioAdapterProps = Omit<
  RadioGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldRadioProps extends FieldRadioCellProps, RadioAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: RadioValue
  defaultValue?: RadioValue
  onChange?: (value: RadioValue) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  style?: CellProps['style']
  cellStyles?: CellStyles
  children?: ReactNode
  options?: readonly RadioOption[]
  direction?: RadioDirection
  gap?: number
}

export function FieldRadio(props: FieldRadioProps) {
  const {
    children,
    options,
    direction,
    gap,
    label,
    labelExtra,
    value,
    defaultValue,
    onChange,
    valueExtra,
    extra,
    required,
    disabled,
    readOnly,
    vertical,
    labelWidth,
    labelAlign,
    valueAlign,
    icon,
    isLink,
    clickable,
    arrowDirection,
    onPress,
    border,
    style,
    cellStyles,
    ...groupProps
  } = props

  const fieldToken = useComponentToken('Field', getFieldToken)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    labelWidth,
    labelAlign,
    vertical,
    cellStyles,
  })

  return (
    <Cell
      title={label}
      titleExtra={labelExtra}
      value={
        <Radio.Group
          {...groupProps}
          options={options}
          value={currentValue}
          onChange={setValue}
          disabled={disabled}
          direction={direction}
          gap={gap}
          pointerEvents={readOnly ? 'none' : groupProps.pointerEvents}
        >
          {children}
        </Radio.Group>
      }
      valueExtra={valueExtra}
      extra={extra}
      required={required}
      disabled={disabled}
      vertical={vertical}
      valueAlign={valueAlign}
      center={props.center}
      icon={icon}
      isLink={isLink}
      clickable={clickable}
      arrowDirection={arrowDirection}
      onPress={onPress}
      border={border}
      style={style}
      onPressDebounceWait={props.onPressDebounceWait}
      styles={resolvedCellStyles}
    />
  )
}

FieldRadio.displayName = 'FieldRadio'
