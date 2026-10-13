import { getFieldAccessibility } from './accessibility'
import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps } from '../cell'
import { Cell } from '../cell'
import { Checkbox } from '../checkbox'
import type { CheckboxGroupProps, CheckboxValue } from '../checkbox'
import { useComponentToken } from '../theme'
import { resolveStyles } from '../style'
import { createFieldCellStyles } from './style'
import { getFieldToken } from './token'
import type { FieldCellProps, FieldStyles, FieldTitleAlign } from './types'
import { useFieldValue } from './useFieldValue'

type CheckboxAdapterProps = Omit<
  CheckboxGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldCheckboxProps extends FieldCellProps, CheckboxAdapterProps {
  title?: ReactNode
  titleExtra?: ReactNode
  description?: ReactNode
  value?: readonly CheckboxValue[]
  defaultValue?: readonly CheckboxValue[]
  onChange?: (value: readonly CheckboxValue[]) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  styles?: FieldStyles<FieldCheckboxProps>
  style?: CellProps['style']
  cellProps?: Pick<CellProps, 'styles'>
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
    description,
    value,
    defaultValue,
    onChange,
    valueExtra,
    trailing,
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
    leading,
    showArrow,
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
    semantic,
  })

  return (
    <Cell
      title={title}
      titleExtra={titleExtra}
      description={description}
      value={
        <Checkbox.Group
          {...groupProps}
          {...getFieldAccessibility(props)}
          style={[{ minWidth: 0, flexShrink: 1 }, semantic?.control]}
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
      trailing={trailing}
      required={required}
      disabled={disabled}
      vertical={vertical}
      valueAlign={valueAlign}
      center={props.center}
      leading={leading}
      showArrow={showArrow}
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
