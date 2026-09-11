import type { ReactNode } from 'react'
import { Field } from './field'
import type { FieldBaseProps } from './types'
import { Radio } from '../radio'
import type { RadioDirection, RadioGroupProps, RadioOption, RadioValue } from '../radio'

type RadioAdapterProps = Omit<
  RadioGroupProps,
  'children' | 'value' | 'defaultValue' | 'disabled' | 'onChange' | 'style'
>

export interface FieldRadioProps extends FieldBaseProps<RadioValue>, RadioAdapterProps {
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
        <Radio.Group
          {...groupProps}
          options={options}
          value={currentValue}
          onChange={handleChange}
          disabled={fieldDisabled}
          direction={direction}
          gap={gap}
          pointerEvents={fieldReadOnly ? 'none' : groupProps.pointerEvents}
        >
          {children}
        </Radio.Group>
      )}
    </Field>
  )
}

FieldRadio.displayName = 'FieldRadio'
