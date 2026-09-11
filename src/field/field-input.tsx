import { forwardRef, useMemo } from 'react'
import type { InputProps, InputStyleState, InputStyles } from '../input'
import { Input } from '../input'
import { resolveStyles } from '../style'
import type { TextInputInstance } from '../text-input'
import { Field } from './field'
import type { FieldBaseProps } from './types'

type InputAdapterProps = Omit<
  InputProps,
  | keyof FieldBaseProps<string>
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onChangeText'
  | 'style'
  | 'styles'
>

export interface FieldInputProps extends FieldBaseProps<string>, InputAdapterProps {
  inputStyle?: InputProps['style']
  inputStyles?: InputStyles
}

function createEmbeddedInputStyles(
  inputStyles: InputStyles | undefined,
  valueAlign: NonNullable<FieldBaseProps<string>['valueAlign']>,
): InputStyles {
  return ({ props, state }: { props: InputProps; state: InputStyleState }) => {
    const custom = resolveStyles(inputStyles, { props, state })
    const isTextarea = props.multiline === true

    return {
      root: [{ width: '100%', flex: 1 }, custom?.root],
      shell: [
        {
          paddingHorizontal: 0,
          borderWidth: 0,
          borderRadius: 0,
          backgroundColor: 'transparent',
        },
        isTextarea ? undefined : { height: undefined, minHeight: undefined },
        custom?.shell,
      ],
      content: [isTextarea ? undefined : { alignItems: 'center' }, custom?.content],
      input: [
        isTextarea
          ? { textAlign: props.textAlign ?? valueAlign }
          : {
              paddingVertical: 0,
              textAlignVertical: 'center',
              textAlign: props.textAlign ?? valueAlign,
            },
        custom?.input,
      ],
      prefix: custom?.prefix,
      suffix: custom?.suffix,
      clear: custom?.clear,
      wordLimit: custom?.wordLimit,
      addonBefore: custom?.addonBefore,
      addonAfter: custom?.addonAfter,
    }
  }
}

export const FieldInput = forwardRef<TextInputInstance, FieldInputProps>(
  function FieldInput(props, ref) {
    const {
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
      inputStyle,
      inputStyles,
      ...inputControlProps
    } = props
    const resolvedValueAlign = valueAlign ?? 'right'
    const embeddedInputStyles = useMemo(
      () => createEmbeddedInputStyles(inputStyles, resolvedValueAlign),
      [inputStyles, resolvedValueAlign],
    )

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
          <Input
            {...inputControlProps}
            value={currentValue ?? ''}
            onChangeText={handleChange}
            bordered={false}
            disabled={fieldDisabled}
            readOnly={fieldReadOnly}
            textAlign={inputControlProps.textAlign ?? resolvedValueAlign}
            ref={ref}
            style={inputStyle}
            styles={embeddedInputStyles}
          />
        )}
      </Field>
    )
  },
)

FieldInput.displayName = 'FieldInput'
