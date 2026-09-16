import { forwardRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import type { InputProps, InputStyleState, InputStyles } from '../input'
import { Input } from '../input'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import type { TextInputInstance } from '../text-input'
import { createFieldCellStyles, getFieldToken } from './style'
import type { FieldCellProps, FieldTitleAlign } from './types'
import { useFieldValue } from './use-field-value'

type InputAdapterProps = Omit<
  InputProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onChangeText'
  | 'onPress'
  | 'disabled'
  | 'readOnly'
  | 'style'
  | 'styles'
>

export interface FieldInputProps extends FieldCellProps, InputAdapterProps {
  title?: ReactNode
  titleExtra?: ReactNode
  label?: ReactNode
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  style?: CellProps['style']
  cellStyles?: CellStyles
  inputStyle?: InputProps['style']
  inputStyles?: InputStyles
}

function createEmbeddedInputStyles(
  inputStyles: InputStyles | undefined,
  valueAlign: NonNullable<FieldInputProps['valueAlign']>,
): InputStyles {
  return ({ props, state }: { props: InputProps; state: InputStyleState }) => {
    const custom = resolveStyles(inputStyles, { props, state })

    return {
      root: [{ width: '100%', flex: 1 }, custom?.root],
      shell: custom?.shell,
      content: custom?.content,
      input: [{ textAlign: props.textAlign ?? valueAlign }, custom?.input],
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
      vertical,
      center = true,
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
      inputStyle,
      inputStyles,
      cellStyles,
      ...inputControlProps
    } = props
    const fieldToken = useComponentToken('Field', getFieldToken)
    const resolvedValueAlign = valueAlign ?? (vertical ? 'left' : 'right')
    const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
    const embeddedInputStyles = useMemo(
      () => createEmbeddedInputStyles(inputStyles, resolvedValueAlign),
      [inputStyles, resolvedValueAlign],
    )
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
          <Input
            {...inputControlProps}
            value={currentValue ?? ''}
            onChangeText={setValue}
            embedded
            bordered={inputControlProps.bordered ?? false}
            activeBordered={inputControlProps.activeBordered ?? false}
            disabled={disabled}
            readOnly={readOnly}
            textAlign={inputControlProps.textAlign ?? resolvedValueAlign}
            ref={ref}
            style={inputStyle}
            styles={embeddedInputStyles}
          />
        }
        valueExtra={valueExtra}
        extra={extra}
        required={required}
        disabled={disabled}
        vertical={vertical}
        valueAlign={resolvedValueAlign}
        center={center}
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
  },
)

FieldInput.displayName = 'FieldInput'
