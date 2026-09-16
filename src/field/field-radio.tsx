import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { useComponentToken } from '../theme'
import { createFieldCellStyles, getFieldToken } from './style'
import { useFieldValue } from './use-field-value'
import type { FieldCellProps, FieldTitleAlign } from './types'
import { Radio } from '../radio'
import type { RadioDirection, RadioGroupProps, RadioOption, RadioValue } from '../radio'

type RadioAdapterProps = Omit<
  RadioGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldRadioProps extends FieldCellProps, RadioAdapterProps {
  title?: ReactNode
  titleExtra?: ReactNode
  label?: ReactNode
  value?: RadioValue
  defaultValue?: RadioValue
  onChange?: (value: RadioValue) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
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
    title,
    titleExtra,
    label,
    value,
    defaultValue,
    onChange,
    valueExtra,
    extra,
    required,
    disabled,
    readOnly,
    variant,
    buttonVariant,
    buttonLayout,
    buttonColumns,
    vertical,
    titleWidth,
    titleAlign,
    valueAlign,
    icon,
    isLink,
    clickable,
    arrowDirection,
    onPress,
    border,
    divider,
    style,
    cellStyles,
    ...groupProps
  } = props

  const fieldToken = useComponentToken('Field', getFieldToken)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    titleWidth,
    titleAlign,
    vertical,
    cellStyles,
  })

  return (
    <Cell
      title={title}
      titleExtra={titleExtra}
      label={label}
      value={
        <Radio.Group
          {...groupProps}
          options={options}
          value={currentValue}
          onChange={setValue}
          disabled={disabled}
          variant={variant}
          buttonVariant={buttonVariant}
          direction={direction}
          gap={gap}
          buttonLayout={buttonLayout ?? 'equal'}
          buttonColumns={buttonColumns}
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
      divider={divider}
      style={style}
      onPressDebounceWait={props.onPressDebounceWait}
      styles={resolvedCellStyles}
    />
  )
}

FieldRadio.displayName = 'FieldRadio'
