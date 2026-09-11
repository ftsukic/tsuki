import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { Checkbox } from '../checkbox'
import type { CheckboxGroupProps, CheckboxValue } from '../checkbox'
import { useComponentToken } from '../theme'
import { createFieldCellStyles, getFieldToken } from './style'
import type { FieldLabelAlign } from './types'
import { useFieldValue } from './use-field-value'

type FieldCheckboxCellProps = Pick<
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

type CheckboxAdapterProps = Omit<
  CheckboxGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldCheckboxProps extends FieldCheckboxCellProps, CheckboxAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: readonly CheckboxValue[]
  defaultValue?: readonly CheckboxValue[]
  onChange?: (value: readonly CheckboxValue[]) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
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
    variant,
    buttonLayout,
    buttonColumns,
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
  const { currentValue, setValue } = useFieldValue<readonly CheckboxValue[]>({
    value,
    defaultValue,
    onChange,
  })
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
        <Checkbox.Group
          {...groupProps}
          value={currentValue}
          onChange={setValue}
          disabled={disabled}
          variant={variant}
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
      style={style}
      onPressDebounceWait={props.onPressDebounceWait}
      styles={resolvedCellStyles}
    />
  )
}

FieldCheckbox.displayName = 'FieldCheckbox'
