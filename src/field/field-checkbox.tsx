import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { Checkbox } from '../checkbox'
import type { CheckboxGroupProps, CheckboxValue } from '../checkbox'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createFieldCellStyles, getFieldStyles, getFieldToken } from './style'
import type { FieldLabelAlign, FieldStatus, FieldStyles } from './types'
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
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellStyles?: CellStyles
  styles?: FieldStyles<FieldCheckboxProps>
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
    vertical,
    labelWidth,
    labelAlign,
    valueAlign,
    description,
    errorMessage,
    status,
    icon,
    isLink,
    clickable,
    arrowDirection,
    onPress,
    border,
    style,
    styles,
    cellStyles,
    ...groupProps
  } = props

  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = resolveFieldStatus(status, errorMessage)
  const state = { status: effectiveStatus }
  const semantic = resolveStyles(styles, { props, state })
  const resolved = getFieldStyles(fieldToken, token, state)
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
        <View style={[{ flex: 1, minWidth: 0 }, resolved.control, semantic?.control]}>
          <Checkbox.Group
            {...groupProps}
            value={currentValue}
            onChange={setValue}
            disabled={disabled}
            direction={direction}
            gap={gap}
            pointerEvents={readOnly ? 'none' : groupProps.pointerEvents}
          >
            {children}
          </Checkbox.Group>
          {renderFieldFeedback(description, errorMessage, resolved, semantic)}
        </View>
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
