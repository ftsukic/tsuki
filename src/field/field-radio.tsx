import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps } from '../cell'
import { Cell } from '../cell'
import { useComponentToken } from '../theme'
import { resolveStyles } from '../style'
import { createFieldCellStyles } from './style'
import { getFieldToken } from './token'
import { useFieldValue } from './useFieldValue'
import type { FieldCellProps, FieldStyles, FieldTitleAlign } from './types'
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
  styles?: FieldStyles<FieldRadioProps>
  style?: CellProps['style']
  cellProps?: Pick<CellProps, 'styles'>
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
    styles,
    style,
    cellProps,
    ...groupProps
  } = props
  const cellStyles = cellProps?.styles

  const semantic = resolveStyles(styles, { props, state: { status: 'default' as const } })
  const fieldToken = useComponentToken('Field', getFieldToken)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    titleWidth,
    titleAlign,
    vertical,
    cellStyles,
    semantic,
  })

  return (
    <Cell
      title={title}
      titleExtra={titleExtra}
      label={label}
      value={
        <Radio.Group
          {...groupProps}
          style={semantic?.content}
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
