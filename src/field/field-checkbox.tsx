import type { ReactNode } from 'react'
import { Checkbox } from '../checkbox'
import type { CheckboxGroupProps, CheckboxValue } from '../checkbox'
import { Field } from './field'
import type { FieldBaseProps } from './types'

type CheckboxAdapterProps = Omit<
  CheckboxGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldCheckboxProps
  extends FieldBaseProps<readonly CheckboxValue[]>, CheckboxAdapterProps {
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
    ...groupProps
  } = props

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
      onPress={onPress}
      border={border}
      style={style}
      styles={styles}
    >
      {({
        value: currentValue,
        onChange: handleChange,
        disabled: fieldDisabled,
        readOnly: fieldReadOnly,
      }) => (
        <Checkbox.Group
          {...groupProps}
          value={currentValue}
          onChange={handleChange}
          disabled={fieldDisabled}
          direction={direction}
          gap={gap}
          pointerEvents={fieldReadOnly ? 'none' : groupProps.pointerEvents}
        >
          {children}
        </Checkbox.Group>
      )}
    </Field>
  )
}

FieldCheckbox.displayName = 'FieldCheckbox'
