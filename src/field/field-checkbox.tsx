import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { Checkbox } from '../checkbox'
import type { CheckboxGroupProps, CheckboxValue } from '../checkbox'
import { useComponentToken } from '../theme'
import { createFieldCellStyles, getFieldToken } from './style'
import type { FieldCellProps, FieldTitleAlign } from './types'
import { useFieldValue } from './use-field-value'

type CheckboxAdapterProps = Omit<
  CheckboxGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldCheckboxProps extends FieldCellProps, CheckboxAdapterProps {
  title?: ReactNode
  titleExtra?: ReactNode
  label?: ReactNode
  value?: readonly CheckboxValue[]
  defaultValue?: readonly CheckboxValue[]
  onChange?: (value: readonly CheckboxValue[]) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  style?: CellProps['style']
  cellStyles?: CellStyles
  children?: ReactNode
  direction?: 'vertical' | 'horizontal'
  gap?: number
}

export function FieldCheckbox(props: FieldCheckboxProps) {
  const {
    children,
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
  const { currentValue, setValue } = useFieldValue<readonly CheckboxValue[]>({
    value,
    defaultValue,
    onChange,
  })
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
        <Checkbox.Group
          {...groupProps}
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
        </Checkbox.Group>
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

FieldCheckbox.displayName = 'FieldCheckbox'
